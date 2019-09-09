function clickGuess(){
    guessText = document.getElementById('guessText').value
    console.log(guessText)
    shipsGuess(guessText);
    $(".modal").modal('hide');
};


function getGuessSql(guessText){
    if(guessText==""){
        sql = "SELECT * FROM ships WHERE user_id=? order by id desc"
    }
    else{
        sql = "SELECT * FROM ships WHERE user_id=? and company_name like '%"+guessText+"%' order by id desc"
    }
    return sql
};

function shipsGuess(guessText=""){
    db.transaction(function (tx) {
        user_id = sessionStorage.getItem('user_id')
        sql = getGuessSql(guessText)
        tx.executeSql(sql,[user_id], function (tx, results) {
            var len = results.rows.length, i;
            if(len < 2)
            {
                msg = '<p>供货次数太少，无法预测！</p>';
                document.querySelector('#center').innerHTML =  msg;
            }
            else
            {
                var company_list=new Array();
                for(i=0;i<len;i++){
                    company_id = results.rows.item(i).company_id
                    if(company_list.indexOf(company_id) == -1){
                        company_list.push(company_id);
                    };
                };
                var x=company_list.length
                table = ''
                for(k=0;k<x;k++){
                    company = company_list[k]
                    guessCompany(company)

                    };
            };
        });
    });
};

function guessCompany(company){
    var product_list = new Array();
    var user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ships WHERE company_id=? and user_id=? order by id desc',
        [company,user_id], function (tx, new_results) {
            var new_len = new_results.rows.length, j;

            for(j=0;j<new_len;j++){
                product_id = new_results.rows.item(j).product_id
                if(product_list.indexOf(product_id) == -1){
                product_list.push(product_id)
                guessNextDay(company,product_id)
                }
            };
        });
    });
};

function dateAdd(startDate,addDays) {
    startDate = new Date(startDate);
    startDate = +startDate + 1000*60*60*24*addDays;
    startDate = new Date(startDate);
    var nextStartDate = startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate();
    return nextStartDate;
};

function shipGuessTable(company,product_info,nextDay){
    table = '<table class="table table-bordered table-block input-lg">' +
                '<tr  style="background-color:#e9faff;">' +
                    '<td>公司名称</td>' +
                    '<td>'+company+'</td>' +
                '</tr><tr>' +
                    '<td class="nameBg">产品信息</td>' +
                    '<td>'+product_info+'</td>' +
                '</tr><tr>' +
                    '<td class="nameBg">预计供货日期</td>' +
                    '<td style="color:red">'+nextDay+'</td>' +
                '</tr></table>'
    return table
};

function guessNextDay(company_id,product_id){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ships WHERE company_id=? and product_id=? order by ship_date desc',
        [company_id,product_id], function (tx, results) {
            var len = results.rows.length, i;
            try {
                var ship_number = results.rows.item(1).weight
                var sDate1 = Date.parse(results.rows.item(0).ship_date);
                var sDate2 = Date.parse(results.rows.item(1).ship_date);
                var dateSpan = Math.abs(sDate2 - sDate1);
                var iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
                var daysNeeded = Math.floor(results.rows.item(1).weight/iDays);
                var daysAdd = Math.floor(results.rows.item(0).weight/daysNeeded);
                var nextDay = dateAdd(results.rows.item(0).ship_date,daysAdd);
            }
            catch (e) {
                nextDay = '供货次数太少，无法预测'
            }finally{
                var company_name = results.rows.item(0).company_name;
                var product_name = results.rows.item(0).product_name;
                var product_type = results.rows.item(0).product_type;
                var unit = results.rows.item(0).unit;
                var product_info = product_name +"/"+product_type+"/"+unit
                table = table + shipGuessTable(company_name,product_info,nextDay);
                document.querySelector('#center').innerHTML =  table;
            }

        }, null);

    });
};

Date.prototype.format = function (format) {
    var args = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter

        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var i in args) {
        var n = args[i];

        if (new RegExp("(" + i + ")").test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
    }
    return format;
};