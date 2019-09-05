document.write("<script  src='../static/js/format.js'></script>");

function addShip(){
    var company_name = document.getElementById('selectCompany').value;
    var ship_date = document.getElementById('shipDate').value;
    var product_name = document.getElementById('productName').value;
    var product_type = document.getElementById('productType').value;
    var weight = document.getElementById('weight').value;
    var total = document.getElementById('total').value;
    var remarks = document.getElementById('remarks').value;
    if(company_name!='' && weight!='' && total!='')
    {
        db.transaction(function (tx) {

            user_id = sessionStorage.getItem('user_id')
            tx.executeSql("INSERT INTO ships(user_id,company_name,ship_date,product_name,product_type,weight,total,pay_total,remarks) values (?,?,?,?,?,?,?,?,?)",
                           [user_id,company_name, ship_date, product_name,product_type,weight,total,0,remarks]);
            msg = '<p>供货记录添加成功！</p>';
            document.querySelector('#msg').innerHTML =  msg;
            window.location.href="ship.html";

        });
    }
    else if(weight=='')
    {
        msg = '发货数不能为空！';
        document.querySelector('#msg').innerHTML =  msg;
    }
    else if(total=='')
    {
        msg = '商品价格不能为空！';
        document.querySelector('#msg').innerHTML =  msg;
    }
};


function shipTable(ship_id,company_name,ship_date,product_name,product_type,total,pay_total,remarks){
    table =     "<tr>" +
            		"<td class='nameBg'>公司名称</td>" +
            		"<td colspan='3' class='text-left'>{0}<button class='btn btn-info' style='position:absolute;left:300px;' onclick='getShipDetail(\"{1}\")'>编辑</button>".replaceValue(company_name,ship_id)+"</td>"+
            	"</tr><tr>" +
            		"<td class='nameBg'>产品名称</td>" +
            		"<td class='text-left'>{0}</td>".replaceValue(product_name) +
            		"<td class='nameBg'>产品型号</td>" +
            		"<td class='text-left'>{0}</td>".replaceValue(product_type) +
            	"</tr><tr>" +
                    "<td class='nameBg'>发货时间</td>" +
                    "<td>{0}</td>".replaceValue(ship_date) +
                    "<td class='nameBg'>总价</td>" +
                    "<td>{0}</td>".replaceValue(total) +
                "</tr><tr>" +
            		"<td class='nameBg'>已付金额</td>" +
            		"<td>{0}</td>".replaceValue(pay_total) +
            		"<td class='nameBg'>未付金额</td>" +
            		"<td>{0}</td>".replaceValue(total-pay_total) +
            	"</tr><tr>" +
            		"<td class='nameBg'>备注</td>" +
            		"<td colspan='3' class='text-left'>{0}</td>".replaceValue(remarks) +
            	"</tr>"
    return table
};
function updateShip(ship_id){
    var company_name = document.getElementById('new_selectCompany').value;
    var ship_date = document.getElementById('new_shipDate').value;
    var product_name = document.getElementById('new_productName').value;
    var product_type = document.getElementById('new_productType').value;
    var weight = document.getElementById('new_weight').value;
    var total = document.getElementById('new_total').value;
    var pay_total = document.getElementById('new_pay_total').value;
    var remarks = document.getElementById('new_remarks').value;
    sql = "update ships set company_name=?,ship_date=?,product_name=?,"+
          "product_type=?,weight=?,total=?,pay_total=?,remarks=? where id=?"
    db.transaction(function (tx) {
        tx.executeSql(sql,[company_name, ship_date, product_name,product_type,weight,total,pay_total,remarks,ship_id]);
        msg = '<p>供货记录修改成功！</p>';
        document.querySelector('#msg').innerHTML =  msg;
        window.location.href="ship.html";
        updateShipRemove();
        clickSearch();
    });

};
function deleteShip(ship_id){
    sql = "delete from ships where id='"+ship_id+"';"
    doExecuteSql(sql);
    updateShipRemove();
    clickSearch();
};

function updateShipRemove(){
  document.querySelector('#updateShip').remove();
  document.getElementsByTagName("body").className='';
};


function getShipDetail(ship_id){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ships WHERE id=?',[ship_id], function (tx, results) {
            var len = results.rows.length, i;
            var company_name = results.rows.item(0).company_name
            var ship_date = results.rows.item(0).ship_date
            var product_name = results.rows.item(0).product_name
            var product_type = results.rows.item(0).product_type
            var weight = results.rows.item(0).weight
            var total = results.rows.item(0).total
            var pay_total = results.rows.item(0).pay_total
            var remarks = results.rows.item(0).remarks
            modal = shipDetail(ship_id,company_name,ship_date,product_name,product_type,weight,total,pay_total,remarks)
            document.querySelector('#shipDetail').innerHTML =  modal;
            document.getElementsByTagName("body").className='modal-open'
        });
    });
};

function shipDetail(ship_id,company_name,ship_date,product_name,product_type,weight,total,pay_total,remarks){
    modal = '<div class="modal fade in" id="updateShip" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: block; overflow-y: scroll">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
                            '<h4 class="modal-title" id="myModalLabel">供货详情</h4>' +
                        '</div>' +
                        '<div id="msg" class="text-center"></div>' +
                        '<form class="form-horizontal" style="margin:20px 10px 10px" method="post" action="#">' +
                            '<div class="form-group text-center">' +
                                '<button type="button" class="btn btn-danger btn-lg margin-0-10-0" onclick=deleteShip("'+ship_id+'")>删除</button>' +
                                '<button type="button" class="btn btn-default btn-lg margin-0-10-0" data-dismiss="modal" onclick="updateShipRemove()">关闭</button>' +
                                '<button type="button" class="btn btn-primary btn-lg margin-0-10-0" onclick=updateShip("'+ship_id+'")>提交</button>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_selectCompany" class="col-xs-4 input-lg">公司名</label>' +
            					'<div class="col-xs-8">' +
            					'<input type="text" class="form-control input-lg" name="new_selectCompany" id="new_selectCompany" value="'+company_name +'"/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_shipDate" class="col-xs-4 input-lg">发货日期</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="date" class="form-control input-lg date-picker" name="new_shipDate" id="new_shipDate" value="'+ship_date+'"/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_productName" class="col-xs-4 input-lg">产品名称</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="text" class="form-control input-lg"placeholder="产品名称" name="new_productName" id="new_productName" value="'+product_name+'"/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_productType" class="col-xs-4 input-lg">产品型号</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="text" class="form-control input-lg" placeholder="产品型号" name="new_productType" id="new_productType" value="'+product_type+'" />' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_weight" class="col-xs-4 input-lg">发货数量</label>' +
                                '<div class="col-xs-4">' +
                                    '<input type="text" class="form-control input-lg" placeholder="发货数" name="new_weight" id="new_weight"  value="'+weight+'" required/>' +
                                '</div>' +
                                '<div class="col-xs-4">' +
                                    '<select id="unit" class=" input-lg">' +
                                        '<option value="KG">KG</option>' +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_total" class="col-xs-4 input-lg">总价</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="text" class="form-control input-lg" placeholder="总价" name="new_total" id="new_total" value="'+total+'" required/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                    '<label for="new_pay_total" class="col-xs-4 input-lg">已付款</label>' +
                                    '<div class="col-xs-8">' +
                                        '<input type="text" class="form-control input-lg" placeholder="已付款金额" name="new_pay_total" id="new_pay_total" value="'+pay_total+'" />' +
                                    '</div>' +
                                '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_remarks" class="col-xs-4 input-lg">备注</label>' +
                                '<div class="col-xs-8">' +
                            '<textarea class="form-control input-lg" placeholder="备注" name="new_remarks" id="new_remarks">'+remarks +'</textarea>' +
                                '</div>' +
                            '</div>' +

                        '</form>' +
                    '</div>' +
                '</div>' +
            '</div>'
    return modal
};

function clickSearch(){
        var startDate = document.getElementById('startDate').value;
        var endDate = document.getElementById('endDate').value;
        var isPay = document.getElementById('isPay').value;
        var searchCompany = document.getElementById('searchCompany').value;
        searchShips(startDate,endDate,isPay,searchCompany);
    };

function resetDate(){
    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    document.getElementById('isPay').value = "0";
    document.getElementById('searchCompany').value = "";
    searchShips();
};

function getSearchShipsSql(startDate,endDate,isPay,searchCompany){
    if(startDate==""&&endDate==""){
        var condition = ""
    }
    if(startDate!=""&&endDate!="" && endDate>startDate){
        var condition = ' and ship_date >=\''+startDate+'\' and ship_date <=\''+endDate+'\''
    }
    if(startDate==""&&endDate!=""){
        var condition = ' and ship_date <=\''+endDate+'\''
    }
    if(startDate!=""&&endDate==""){
        var condition = ' and ship_date >=\''+startDate+'\''
    }
    if(isPay==1){
        condition = condition + " and pay_total=0 "
    }
    if(isPay==2){
        condition = condition + " and pay_total=total "
    }
    if(isPay==3){
        condition = condition + " and pay_total<>total and pay_total<>0 "
    }
    if(searchCompany!=""){
        condition = condition + " and company_name like '%"+searchCompany+"%' "
    }
    sql = 'SELECT * FROM ships WHERE user_id=? '+condition+' order by ship_date desc'
    return sql
};

function searchShips(startDate="",endDate="",isPay=0,searchCompany=""){
    user_id = sessionStorage.getItem('user_id');
    sql = getSearchShipsSql(startDate,endDate,isPay,searchCompany);
    db.transaction(function (tx) {
        tx.executeSql(sql, [user_id], function (tx, results) {
            var len = results.rows.length, i;
            if(len==0)
                {
                    btn = '<p>供货记录为空，赶紧添加吧！</p>'+
                        '<button class="btn btn-default btn-lg" data-toggle="modal" data-target="#addShip">供货</button>'
                    document.querySelector('#center').innerHTML =  btn;
                }
                else
                {
                    table = "<table class='table table-bordered table-block input-lg' id='shipsTable'>"
                    for(i=0;i<len;i++){
                        var ship_id = results.rows.item(i).id
                        var company_name = results.rows.item(i).company_name
                        var ship_date = results.rows.item(i).ship_date
                        var product_name = results.rows.item(i).product_name
                        var product_type = results.rows.item(i).product_type
                        var total = results.rows.item(i).total
                        var pay_total = results.rows.item(i).pay_total
                        var remarks = results.rows.item(i).remarks
                        table = table + shipTable(ship_id,company_name,ship_date,product_name,product_type,total,pay_total,remarks)
                        if(i<len-1){
                            table = table + "<tr><td colspan='4'></td></tr>"
                        };
                    };
                    table = table + "</table>"
                    document.querySelector('#center').innerHTML =  table;
                };
        }, null);
    });
};


function exportShip(fileName){
    var startDate = document.getElementById('startDate').value;
    var endDate = document.getElementById('endDate').value;
    var isPay = document.getElementById('isPay').value;
    var searchCompany = document.getElementById('searchCompany').value;
    sql = getSearchShipsSql(startDate,endDate,isPay,searchCompany);
    user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
      tx.executeSql(sql, [user_id], function (tx, results) {
          var len = results.rows.length, i;
          table = '<table class="table table-bordered table-block input-lg" id="exportTable">' +
                        "<tr>" +
                            "<td>公司名称</td>" +
                            "<td>发货时间</td>" +
                            "<td>产品名称</td>" +
                            "<td>产品型号</td>" +
                            "<td>供货重量（KG）</td>" +
                            "<td>总价</td>" +
                            "<td>已支付金额</td>" +
                            "<td>未支付金额</td>" +
                            "<td>备注</td>" +
                        "</tr>"
          for(i=0;i<len;i++){
              var ship_id = results.rows.item(i).id
              var company_name = results.rows.item(i).company_name
              var ship_date = results.rows.item(i).ship_date
              var product_name = results.rows.item(i).product_name
              var product_type = results.rows.item(i).product_type
              var weight = results.rows.item(i).weight
              var total = results.rows.item(i).total
              var pay_total = results.rows.item(i).pay_total
              var remarks = results.rows.item(i).remarks
              table = table + exportTable(company_name,ship_date,product_name,product_type,weight,total,pay_total,remarks)
          };
          table = table + '<tr><td>时间</td><td>'+(startDate==""?'-':startDate)+'至'+(endDate==""?'-':endDate)+'</td></tr></table>';
          document.querySelector('#export').innerHTML =  table;
          downloadExcel("exportTable",fileName)
          document.getElementById('exportTable').remove();

      }, null);
    });
};

function exportTable(company_name,ship_date,product_name,product_type,weight,total,pay_total,remarks){
    remaining = total - pay_total
    table = "<tr>" +
                "<td>{0}</td>".replaceValue(company_name) +
                "<td>{0}</td>".replaceValue(ship_date) +
                "<td>{0}</td>".replaceValue(product_name) +
                "<td>{0}</td>".replaceValue(product_type) +
                "<td>{0}</td>".replaceValue(weight) +
                "<td>{0}</td>".replaceValue(total) +
                "<td>{0}</td>".replaceValue(pay_total) +
                "<td>{0}</td>".replaceValue(remaining) +
                "<td>{0}</td>".replaceValue(remarks) +
            "</tr>"
    return table
}