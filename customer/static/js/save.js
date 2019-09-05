

$("#exportCompany").click(function(){
    var content = "公司名称||公司地址||联系人||电话||备注"+"\r\n"
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM company',[], function (tx, results) {
        var len = results.rows.length, i;
        for(i=0;i<len;i++){
            var company = results.rows.item(i).company
            var address = results.rows.item(i).address!=""?results.rows.item(i).address:"空"
            var contacts = results.rows.item(i).contacts!=""?results.rows.item(i).contacts:"空"
            var phone = results.rows.item(i).phone!=""?results.rows.item(i).phone:"空"
            var remarks = results.rows.item(i).remarks!=""?results.rows.item(i).remarks:"空"
            content = content + company+"||"+address+"||"+contacts+"||"+phone+"||"+remarks +"\r\n"
        };
        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "客户信息.txt");
        });
    });
});

$("#exportShip").click(function(){
    var content = "公司名称||供货日期||产品名称||产品类型||产品数量||产品总价||已付金额||备注"+"\r\n"
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ships',[], function (tx, results) {
        var len = results.rows.length, i;
        for(i=0;i<len;i++){
            var company_name = results.rows.item(0).company_name
            var ship_date = results.rows.item(0).ship_date
            var product_name = results.rows.item(0).product_name!=""?results.rows.item(i).product_name:"空"
            var product_type = results.rows.item(0).product_type!=""?results.rows.item(i).product_type:"空"
            var weight = results.rows.item(0).weight
            var total = results.rows.item(0).total
            var pay_total = results.rows.item(0).pay_total
            var remarks = results.rows.item(0).remarks!=""?results.rows.item(i).remarks:"空"
            content = content + company_name+"||"+ship_date+"||"+product_name+"||"+product_type+"||"+weight+"||"+total+"||"+pay_total+"||"+remarks +"\r\n"
        };
        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "供货信息.txt");
        });
    });
});

$("#import").click(function(){//点击导入按钮，使files触发点击事件，然后完成读取文件的操作。
        $("#files").click();
});

function importFile(){
    var selectedFile = document.getElementById("files").files[0];//获取读取的File对象
    var name = selectedFile.name;//读取选中文件的文件名
    var size = selectedFile.size;//读取选中文件的大小
    console.log("文件名:"+name+"大小："+size);

    var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
    reader.readAsText(selectedFile);//读取文件的内容

    reader.onload = function(){
        console.log(this.result);//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。
    };
};

