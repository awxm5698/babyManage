
var db = openDatabase('customer', '1.0', 'Test DB', 2 * 1024 * 1024);

db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS ships(id integer primary key autoincrement, user_id,company_name, ship_date, product_name,product_type,weight,total,pay_total,remarks)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS company(id integer primary key autoincrement, user_id,company, address, contacts, phone, remarks)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS user(id integer primary key autoincrement, user_name, password)');

});


function doExecuteSql(sql){
    db.transaction(function (tx) {
        tx.executeSql(sql)
    });
};