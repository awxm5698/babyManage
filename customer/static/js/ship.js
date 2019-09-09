document.write("<script  src='../static/js/format.js'></script>");

function addShip(){
    var company = document.getElementById('selectCompany')
    var company_id = company.value;
    var company_name = company[company.selectedIndex].text;
    var product = document.getElementById('selectProduct')
    var product_id = product.value;
    var ship_date = document.getElementById('shipDate').value;
//    var product_name = document.getElementById('productName').value;
//    var product_type = document.getElementById('productType').value;
    var weight = document.getElementById('weight').value;
    var total = document.getElementById('total').value;
    var remarks = document.getElementById('remarks').value;
    var user_id = sessionStorage.getItem('user_id')
    if(company_name!='' && weight!='' && total!='')
    {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM product WHERE id=?',[product_id], function (tx, results) {
                var len = results.rows.length, i;
                var product_name = results.rows.item(0).product_name
                var product_type = results.rows.item(0).product_type
                var unit = results.rows.item(0).unit
                var commission_rate = results.rows.item(0).commission_rate
                var commission = Math.floor(total*commission_rate/100)
                console.log(commission)
                tx.executeSql("INSERT INTO ships(user_id,company_id,company_name,ship_date,product_id,product_name,"+
                "product_type,unit,weight,total,pay_total,commission,remarks) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [user_id,company_id,company_name, ship_date, product_id,product_name,product_type,unit,weight,total,0,commission,remarks]);

                msg = '<p>供货记录添加成功！</p>';
                document.querySelector('#msg').innerHTML =  msg;
                window.location.href="ship.html";
            });
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

function updateShip(ship_id){
    var ship_date = document.getElementById('new_shipDate').value;
    var weight = document.getElementById('new_weight').value;
    var pay_total = document.getElementById('new_pay_total').value;
    var remarks = document.getElementById('new_remarks').value;
    sql = "update ships set ship_date=?,weight=?,pay_total=?,remarks=? where id=?"
    db.transaction(function (tx) {
        tx.executeSql(sql,[ship_date,weight,pay_total,remarks,ship_id]);
        msg = '<p>供货记录修改成功！</p>';
        document.querySelector('#msg').innerHTML =  msg;
        window.location.href="ship.html";
        updateShipRemove();
        clickSearch();
    });

};


function updateShipRemove(){
  document.querySelector('#updateShip').remove();
  document.getElementsByTagName("body").className='';
};

function deleteShipModalRemove(){
    document.querySelector('#deleteModal').remove();
};

function deleteShip(ship_id){
    sql = "delete from ships where id='"+ship_id+"';"
    doExecuteSql(sql);
    deleteShipModalRemove();
    updateShipRemove();
    clickSearch();
};

function getShipDeleteModal(ship_id){
    modal = document.getElementById('shipDeleteDemo').innerHTML
    modal = modal.replaceValue('deleteModal',ship_id)
    document.querySelector('#shipDelete').innerHTML =  modal;
}

function getShipDetail(ship_id){
    shipDetailDemo = document.getElementById('shipDetailDemo').innerHTML
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ships WHERE id=?',[ship_id], function (tx, results) {
            var len = results.rows.length, i;
            var company_name = results.rows.item(0).company_name
            var ship_date = results.rows.item(0).ship_date
            var product_name = results.rows.item(0).product_name
            var product_type = results.rows.item(0).product_type
            var unit = results.rows.item(0).unit
            var weight = results.rows.item(0).weight
            var total = results.rows.item(0).total
            var pay_total = results.rows.item(0).pay_total
            var remarks = results.rows.item(0).remarks
            modal = shipDetailDemo.replaceValue(ship_id,company_name,ship_date,product_name,product_type,unit,weight,total,pay_total,remarks,"updateShip")
            document.querySelector('#shipDetail').innerHTML =  modal;
            document.getElementsByTagName("body").className='modal-open'
        });
    });
};

function clickSearch(){
        var startDate = document.getElementById('startDate').value;
        var endDate = document.getElementById('endDate').value;
        var isPay = document.getElementById('isPay').value;
        var searchCompany = document.getElementById('searchCompany').value;
        var searchProduct = document.getElementById('searchProduct').value
        searchShips(startDate,endDate,isPay,searchCompany,searchProduct);
        $('.modal').modal('hide')
    };

function resetDate(){
    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    document.getElementById('isPay').value = "0";
    document.getElementById('searchCompany').value = "";
    document.getElementById('searchProduct').value = "";
    searchShips();
};

function getSearchShipsSql(startDate,endDate,isPay,searchCompany,searchProduct){
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
    if(searchProduct!=""){
        condition = condition + " and (product_name like '%"+searchProduct+"%' or product_type like '%"+searchProduct+"%')"
    }
    sql = 'SELECT * FROM ships WHERE user_id=? '+condition+' order by ship_date desc'
    return sql
};

function searchShips(startDate="",endDate="",isPay=0,searchCompany="",searchProduct=""){
    user_id = sessionStorage.getItem('user_id');
    sql = getSearchShipsSql(startDate,endDate,isPay,searchCompany,searchProduct);
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
                    tableDemo = document.getElementById('shipTableDemo').innerHTML
                    table = ""
                    for(i=0;i<len;i++){
                        var ship_id = results.rows.item(i).id
                        var company_name = results.rows.item(i).company_name
                        var ship_date = results.rows.item(i).ship_date
                        var product_name = results.rows.item(i).product_name
                        var product_type = results.rows.item(i).product_type
                        var unit = results.rows.item(i).unit
                        var weight = results.rows.item(i).weight
                        var total = results.rows.item(i).total
                        var pay_total = results.rows.item(i).pay_total
                        var remarks = results.rows.item(i).remarks
                        var product_info = product_name+'/'+product_type+'/'+unit
                        var remaining = total - pay_total
                        table = table + tableDemo.replaceValue(ship_id,company_name,
                        ship_date,product_info,weight,total,pay_total,remaining,remarks)
                    };
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
    var searchProduct = document.getElementById('searchProduct').value
    sql = getSearchShipsSql(startDate,endDate,isPay,searchCompany,searchProduct);
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
                            "<td>提成预估</td>" +
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
              var commission = results.rows.item(i).commission
              var remarks = results.rows.item(i).remarks
              table = table + exportShipTable(company_name,ship_date,product_name,product_type,weight,total,pay_total,commission,remarks)
          };
          table = table + '<tr><td>时间</td><td>'+(startDate==""?'-':startDate)+'至'+(endDate==""?'-':endDate)+'</td></tr></table>';
          document.querySelector('#export').innerHTML =  table;
          downloadExcel("exportTable",fileName)
          document.getElementById('exportTable').remove();

      }, null);
    });
};

function exportShipTable(company_name,ship_date,product_name,product_type,weight,total,pay_total,commission,remarks){
    remaining = total - pay_total
    table = "<tr>" +
                "<td>{0}</td>" +
                "<td>{1}</td>" +
                "<td>{2}</td>" +
                "<td>{3}</td>" +
                "<td>{4}</td>" +
                "<td>{5}</td>" +
                "<td>{6}</td>" +
                "<td>{7}</td>" +
                "<td>{8}</td>" +
                "<td>{9}</td>" +
            "</tr>"
    table = table.replaceValue(company_name,ship_date,product_name,product_type,weight,total,pay_total,remaining,commission,remarks)
    return table
}