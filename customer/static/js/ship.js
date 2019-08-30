
function addShip(){
    var company_name = document.getElementById('company').value;
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
            msg = '<p>客户添加成功！</p>';
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