$('#uploadCompany').change(function(e) {
    var files = e.target.files;
    var fileReader = new FileReader();
    fileReader.onload = function(ev) {
        try {
            var data = ev.target.result
            var workbook = XLSX.read(data, {type: 'binary'}) // 以二进制流方式读取得到整份excel表格对象
            var persons = [] // 存储获取到的数据

        } catch (e) {
            console.log('文件类型不正确');
            return;
        }

        // 表格的表格范围，可用于判断表头是否数量是否正确
        var fromTo = '';
        // 遍历每张表读取
        for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                fromTo = workbook.Sheets[sheet]['!ref'];
                console.log(fromTo);
                persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                break;
            }
        }

        var data = '';
        console.log(persons.length)
        keys = ['公司名称','公司地址','联系人','电话','备注']
        for(i=0;i<persons.length;i++){
            person = persons[i]
            for(j=0;j<keys.length;j++){
                data = data + person[keys[j]] + ';'
            }
        }
        var button = '<label class="checkbox-inline input-lg" style="position:relative;top:10px;left:50px;">'+
                     '<input type="checkbox" id="deleteChecked" value="">删除原有数据</label>'+
                     '<button id="uploadButton" onclick="startUploadCompany()" class="btn btn-primary"'+
                     'style="position:relative;top:10px;left:100px;">开始上传</button>'
        document.querySelector('#companyUploadButton').innerHTML = button;
        var importValue = "<input id='importValue' value='" +data+ "'/>";
        document.querySelector('#import').innerHTML = importValue;
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
    });


function startUploadCompany(){
    try{
    importValue = document.getElementById('importValue').value;
    }catch{
        alert('请先选择文件')
    }
    values = importValue.split(';')
    lines = values.length/6
    user_id = sessionStorage.getItem('user_id')
    if(document.getElementById('deleteChecked').checked){
        sql = "Delete from company where user_id ='"+user_id+"'";
        doExecuteSql(sql)
    }
    for(i=0;i<lines;i++){
        var va = [user_id]
        for(j=0;j<5;j++){
//            console.log('序号',j+5*i,'值',values[j+5*i])
            va.push(values[j+5*i]!="undefined"?values[j+5*i]:"")
        }
        var sql = "INSERT INTO company(user_id,company,address,contacts,phone,remarks) values ('{0}','{1}','{2}','{3}','{4}','{5}')".replaceValue(va)
        doExecuteSql(sql)
    }
    var msg = '<p id="msg">上传成功！</p>'
        document.querySelector('#uploadMsg').innerHTML = msg;
    var obj=document.getElementById('uploadCompany');
        obj.outerHTML=obj.outerHTML
    document.getElementById('importValue').remove();
    document.getElementById('uploadButton').remove();
    $(".modal").modal('hide')
    window.setTimeout(function(){
              location.reload();},3000);
};

$('#uploadShip').change(function(e) {
    var files = e.target.files;
    var fileReader = new FileReader();
    fileReader.onload = function(ev) {
        try {
            var data = ev.target.result
            var workbook = XLSX.read(data, {type: 'binary'}) // 以二进制流方式读取得到整份excel表格对象
            var persons = [] // 存储获取到的数据

        } catch (e) {
            console.log('文件类型不正确');
            return;
        }

        // 表格的表格范围，可用于判断表头是否数量是否正确
        var fromTo = '';
        // 遍历每张表读取
        for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                fromTo = workbook.Sheets[sheet]['!ref'];
                console.log(fromTo);
                persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                break;
            }
        }

        var data = '';
        console.log(persons.length)
        keys = ['公司名称','发货时间','产品名称','产品型号','供货重量（KG）','总价','已支付金额','备注']
        for(i=0;i<persons.length;i++){
            person = persons[i]
            for(j=0;j<keys.length;j++){
                data = data + person[keys[j]] + ';'
            }
        }
        console.log(data)
        var button = '<label class="checkbox-inline input-lg" style="position:relative;top:10px;left:50px;">'+
                     '<input type="checkbox" id="deleteChecked" value="">删除原有数据</label>'+
                     '<button id="uploadButton" onclick="startUploadShip()" class="btn btn-primary"'+
                     'style="position:relative;top:10px;left:100px;">开始上传</button>'
        document.querySelector('#shipUploadButton').innerHTML = button;
        var importValue = "<input id='importValue' value='" +data+ "'/>";
        document.querySelector('#import').innerHTML = importValue;
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
});

function startUploadShip(){
    try{
    importValue = document.getElementById('importValue').value;
    }catch{
        alert('请先选择文件')
    }
    values = importValue.split(';')
    lines = Math.floor(values.length/8)

    user_id = sessionStorage.getItem('user_id')
    if(document.getElementById('deleteChecked').checked){
        sql = "Delete from ships where user_id ='"+user_id+"'";
        doExecuteSql(sql)
    }
    for(i=0;i<lines - 1;i++){
        var va = [user_id]
        for(j=0;j<8;j++){
//            console.log('序号',j+5*i,'值',values[j+5*i])
            va.push(values[j+8*i]!="undefined"?values[j+8*i]:"")

        }
        console.log(va)
        var sql = "INSERT INTO ships(user_id,company_name,ship_date,product_name,product_type,weight,total,pay_total,remarks)"+
                  " values ('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}')".replaceValue(va)
        doExecuteSql(sql)
        console.log(sql)
    }
    var msg = '<p id="msg">上传成功！</p>'
        document.querySelector('#uploadMsg').innerHTML = msg;
    var obj=document.getElementById('uploadShip');
        obj.outerHTML=obj.outerHTML
    document.getElementById('importValue').remove();
    document.getElementById('uploadButton').remove();
    $(".modal").modal('hide')
    window.setTimeout(function(){
          location.reload();},3000);


};