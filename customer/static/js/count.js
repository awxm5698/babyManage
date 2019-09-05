
function resetDate(){
    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    document.getElementById('searchCompany').value = "";
};

function getSaleCountSql(startDate,endDate,searchCompany){
    var condition = ""
    if(startDate!=""&&endDate!="" && endDate>startDate){
        var condition = " and ship_date>='"+startDate+"' and ship_date<='"+endDate+"' "
    }
    if(startDate==""&&endDate!=""){
        var condition = " and ship_date<='"+endDate+"' "
    }
    if(startDate!=""&&endDate==""){
        var condition = " and ship_date>='"+startDate+"' "
    }
    if(searchCompany!=""){
            condition = condition + " and company_name like '%"+searchCompany+"%' "
        }
    sql = "select company_name, sum(weight) as total_weight,sum(total) as total_amount, sum(pay_total) as pay_amount from ships where user_id=? "+condition+" group by company_name"
    return sql
};

function saleCount(startDate="",endDate="",searchCompany=""){
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var searchCompany = document.getElementById('searchCompany').value;
    sql = getSaleCountSql(startDate,endDate,searchCompany);
    user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
        tx.executeSql(sql,[user_id], function (tx, results) {
            var len = results.rows.length, i;
            if(len>0){
//                table = '<h3 class="text-center">销售统计</h3>'+
                table = '<table class="table table-bordered table-block input-lg" id="countTable">'
                for(i=0;i<len;i++){
                    table = table + saleCountTable(results.rows.item(i).company_name,
                                                   results.rows.item(i).total_weight,
                                                   results.rows.item(i).total_amount,
                                                   results.rows.item(i).pay_amount);
                    if(i<len-1){
                        table = table + "<tr><td colspan='4'></td></tr>"
                    }
                }
                table = table + "</table>"
            }
            else
            {
                table = "<p>搜索结果为空</p>"
            }
            document.querySelector('#center').innerHTML =  table ;
        }, null);

    });
};

function saleCountTable(company,total_weight,total_amount,pay_amount){
    table = '<tr>' +
                '<td  class="nameBg">公司名称</td>' +
                '<td colspan="3">'+company+'</td>' +
            '</tr><tr>' +
           		'<td class="nameBg">总发货量/KG</td>' +
           		'<td>'+total_weight+'</td>' +
           		'<td class="nameBg">总销售额</td>' +
           		'<td>'+total_amount+'</td>' +
           	'</tr><tr>' +
           		'<td class="nameBg">已付款</td>' +
           		'<td>'+pay_amount+'</td>' +
           		'<td class="nameBg">待付款</td>' +
           		'<td>'+(total_amount-pay_amount)+'</td>' +
           	'</tr>'
    return table
};


function exportCount(fileName){
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var searchCompany = document.getElementById('searchCompany').value;
    sql = getSaleCountSql(startDate,endDate,searchCompany);
    user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
        tx.executeSql(sql, [user_id], function (tx, results) {
            var len = results.rows.length, i;
            table = '<table class="table table-bordered table-block input-lg" id="exportTable">' +
                        "<tr>" +
                            "<td>公司名称</td>" +
                            "<td>发货总重量（KG）</td>" +
                            "<td>产品总金额</td>" +
                            "<td>已付款金额</td>" +
                            "<td>未付款金额</td>" +
                        "</tr>"

            for(i=0;i<len;i++){
                var company_name=results.rows.item(i).company_name
                var total_weight=results.rows.item(i).total_weight
                var total_amount=results.rows.item(i).total_amount
                var pay_amount=results.rows.item(i).pay_amount
                var total_remaining = total_amount - pay_amount
                table = table + exportTable(company_name,total_weight,total_amount,pay_amount,total_remaining)
            };
            table = table + '<tr><td>时间</td><td>'+(startDate==""?'-':startDate)+'至'+(endDate==""?'-':endDate)+'</td></tr></table>';
            document.querySelector('#export').innerHTML =  table;
            downloadExcel("exportTable",fileName)
            document.getElementById('exportTable').remove();

        }, null);
    });
};

function exportTable(company_name,total_weight,total_amount,pay_amount,total_remaining){
    console.log(total_remaining)
    table = "<tr>" +
                "<td>{0}</td>".replaceValue(company_name) +
                "<td>{0}</td>".replaceValue(total_weight) +
                "<td>{0}</td>".replaceValue(total_amount) +
                "<td>{0}</td>".replaceValue(pay_amount) +
                "<td>{0}</td>".replaceValue(total_remaining) +
            "</tr>"
    return table
}