
function shipsGuess(){
    db.transaction(function (tx) {
        user_id = sessionStorage.getItem('user_id')
        tx.executeSql('SELECT * FROM ships WHERE user_id=? order by id desc',
        [user_id], function (tx, results) {
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
                    name = results.rows.item(i).company_name
                    if(company_list.indexOf(name) == -1){
                        company_list.push(name);
                    };
                };
                var x=company_list.length
//                table = '<h4 class="input-lg" data-toggle="modal" data-target="#shipsGuess">供货预测</h4>';
                table = ''
                for(i=0;i<x;i++){
                    guessNextDay(company_list[i]);
                };
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

function shipGuessTable(company,nextDay){
    table = '<table class="table table-bordered table-block input-lg">' +
                '<tr>' +
                    '<td class="nameBg">公司名称</td>' +
                    '<td>'+company+'</td>' +
                '</tr><tr>' +
                    '<td class="nameBg">预计供货日期</td>' +
                    '<td style="color:red">'+nextDay+'</td>' +
                '</tr></table>'
    return table
};

function guessNextDay(company_name){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ships WHERE company_name=? order by ship_date desc',
        [company_name], function (tx, results) {
            var len = results.rows.length, i;
            try {
                ship_number = results.rows.item(1).weight
                sDate1 = Date.parse(results.rows.item(0).ship_date);
                sDate2 = Date.parse(results.rows.item(1).ship_date);
                dateSpan = Math.abs(sDate2 - sDate1);
                iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
                daysNeeded = Math.floor(results.rows.item(1).weight/iDays);
                daysAdd = Math.floor(results.rows.item(0).weight/daysNeeded);
                nextDay = dateAdd(results.rows.item(0).ship_date,daysAdd);
            }
            catch{
                nextDay = '供货次数太少，无法预测'
            }finally{
                table = table + shipGuessTable(company_name,nextDay);
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