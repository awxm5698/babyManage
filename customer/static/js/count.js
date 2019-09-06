
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
    sql = "select company_name,product_name,product_type,unit, sum(weight) as total_weight,sum(total) as total_amount,"+
           "sum(pay_total) as pay_amount from ships where user_id=? "+
           condition + " group by company_id,product_id"
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
                tableDemo = document.getElementById("countTable").innerHTML
                table = ""
                for(i=0;i<len;i++){
                    var company_name = results.rows.item(i).company_name
                    var total_weight = results.rows.item(i).total_weight
                    var total_amount = results.rows.item(i).total_amount
                    var pay_amount = results.rows.item(i).pay_amount
                    var product_name = results.rows.item(i).product_name
                    var product_type = results.rows.item(i).product_type
                    var unit = results.rows.item(i).unit
                    var product_info = product_name+"/"+product_type+"/"+unit
                    var total_remaining = total_amount -pay_amount
                    table = table + tableDemo.replaceValue(company_name,product_info,
                        total_weight,total_amount,pay_amount,total_remaining);
                }
            }
            else
            {
                table = "<p>搜索结果为空</p>"
            }
            document.querySelector('#center').innerHTML =  table ;
            $('.modal').modal('hide')
        }, null);

    });
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
    table = "<tr>" +
                "<td>{0}</td>" +
                "<td>{1}</td>" +
                "<td>{2}</td>" +
                "<td>{3}</td>" +
                "<td>{4}</td>" +
            "</tr>"
    table = table.replaceValue(company_name,total_weight,total_amount,pay_amount,total_remaining)
    return table
}