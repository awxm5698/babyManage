
function addProduct(){
    var productName = document.getElementById('productName').value;
    var productType = document.getElementById('productType').value;
    var unit = document.getElementById('unit').value;
    var price = document.getElementById('price').value;
    var rate = document.getElementById('rate').value;
    var remarks = document.getElementById('remarks').value;
    user_id = sessionStorage.getItem('user_id')
    if(productName!='' && productType!=''){
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM product WHERE user_id=? and product_name=? and product_type=?',
            [user_id,productName,productType], function (tx, results) {
                var len = results.rows.length, i;
                console.log(len)
                if(len == '1')
                {
                    msg = '该产品已存在！';
                    document.querySelector('#msg').innerHTML =  msg;
                }
                else
                {
                    tx.executeSql("INSERT INTO product(user_id,product_name,product_type,unit,unit_price,commission_rate,remarks) values (?,?,?,?,?,?,?)",
                                   [user_id,productName,productType,unit,price,rate,remarks]);
                    msg = '<p>产品添加成功！</p>';
                    document.querySelector('#msg').innerHTML =  msg;
                    window.location.href="product.html";
                };

            });
        });
    }
    else
    {
        msg = '产品名称和型号不能为空';
        document.querySelector('#msg').innerHTML =  msg;
    }
};

function getSearchProductSql(searchText){
    if(searchText=="")
    {
        sql = "Select * from product where user_id=?";
    }
    else
    {
        sql = "Select * from product where user_id=? and product_name like'%"+searchText+"%' or product_type like'%"+searchText+"%'";
    }

    return sql
};

function resetText(){
    searchText = document.getElementById('searchText').value = "";
    searchProduct();
};

function clickSearch(){
        var searchText = document.getElementById('searchText').value;
        searchProduct(searchText);
        $('.modal').modal('hide')
    };

function searchProduct(searchText=""){
    sql = getSearchProductSql(searchText);
    user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
        tx.executeSql(sql, [user_id], function (tx, results) {
            var len = results.rows.length, i;
            if(len==0)
                {
                    btn = '<p>产品不存在，赶紧添加吧！</p>'+
                        '<button class="btn btn-default btn-lg" data-toggle="modal" data-target="#addProduct">新产品</button>'
                    document.querySelector('#center').innerHTML =  btn;
                }
            else
                {
                    tableDemo = document.getElementById('productTableDemo').innerHTML
                    table = ""
                    for(i=0;i<len;i++){
                        var product_id = results.rows.item(i).id
                        var product_name = results.rows.item(i).product_name
                        var product_type = results.rows.item(i).product_type
                        var unit = results.rows.item(i).unit
                        var unit_price = results.rows.item(i).unit_price
                        var commission_rate = results.rows.item(i).commission_rate
                        var remarks = results.rows.item(i).remarks
                        table = table + tableDemo.replaceValue(product_id,product_name,product_type,unit,unit_price,commission_rate,remarks)
                    };
                    document.querySelector('#center').innerHTML =  table;
                };
        }, null);
    });
};

function getProductDetail(product_id){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM product WHERE id=?',
        [product_id], function (tx, results) {
            var len = results.rows.length, i;
            var product_id = results.rows.item(i).id
            var product_name = results.rows.item(i).product_name
            var product_type = results.rows.item(i).product_type
            var unit = results.rows.item(i).unit
            var unit_price = results.rows.item(i).unit_price
            var commission_rate = results.rows.item(i).commission_rate
            var remarks = results.rows.item(i).remarks
            modal = document.getElementById('productDetailDemo').innerHTML
            modal = modal.replaceValue("updateProduct",product_id,product_name,product_type,unit,unit_price,commission_rate,remarks)
            document.querySelector('#productDetail').innerHTML =  modal;
        });
    });
};

function updateProductRemove(){
    document.querySelector('#updateProduct').remove();
};


function deleteProductModalRemove(){
    document.querySelector('#deleteModal').remove();
};

function deleteProduct(product_id){
    sql = "delete from product where id='"+product_id+"'";
    doExecuteSql(sql);
    deleteProductModalRemove();
    updateProductRemove();
    searchProduct()
}

function getProductDeleteModal(product_id){
    modal = document.getElementById('productDeleteDemo').innerHTML
    modal = modal.replaceValue('deleteModal',product_id)
    document.querySelector('#productDelete').innerHTML =  modal;
}

function updateProduct(product_id){
    var productName = document.getElementById('new_productName').value;
    var productType = document.getElementById('new_productType').value;
    var unit = document.getElementById('new_unit').value;
    var price = document.getElementById('new_price').value;
    var rate = document.getElementById('new_rate').value;
    var remarks = document.getElementById('new_remarks').value;
    sql = "UPDATE product set product_name=?,product_type=?,unit=?,unit_price=?,commission_rate=?,remarks=? where id=?"
    console.log(sql)
    db.transaction(function (tx) {
        tx.executeSql(sql ,[productName,productType,unit,price,rate,remarks,product_id]);
        console.log(productName,productType,unit,price,rate,remarks,product_id)
        updateProductRemove();
        searchProduct();
    });

};

function exportProduct(fileName){
    searchText = document.getElementById('searchText').value = "";
    sql = getSearchProductSql(searchText);
    user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
      tx.executeSql(sql, [user_id], function (tx, results) {
          var len = results.rows.length, i;
          table = '<table class="table table-bordered table-block input-lg" id="exportTable">' +
                        "<tr>" +
                            "<td>产品名称</td>" +
                            "<td>产品型号</td>" +
                            "<td>产品单位</td>" +
                            "<td>产品单价</td>" +
                            "<td>佣金比例</td>" +
                            "<td>备注</td>" +
                        "</tr>"
          for(i=0;i<len;i++){
              var product_name = results.rows.item(i).product_name
              var product_type = results.rows.item(i).product_type
              var unit = results.rows.item(i).unit
              var unit_price = results.rows.item(i).unit_price
              var commission_rate = results.rows.item(i).commission_rate
              var remarks = results.rows.item(i).remarks
              table = table + exportTable(product_name,product_type,unit,unit_price,commission_rate,remarks)
          };
          table = table + "</table>";
          document.querySelector('#export').innerHTML =  table;
          downloadExcel("exportTable",fileName)
          document.getElementById('exportTable').remove();

      }, null);
    });
};

function exportTable(product_name,product_type,unit,unit_price,commission_rate,remarks){
    table = "<tr>" +
                "<td>{0}</td>" +
                "<td>{1}</td>" +
                "<td>{2}</td>" +
                "<td>{3}</td>" +
                "<td>{4}</td>" +
                "<td>{5}</td>" +
            "</tr>"
    table = table.replaceValue(product_name,product_type,unit,unit_price,commission_rate,remarks)
    return table
}