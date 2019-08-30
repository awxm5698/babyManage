String.prototype.signMix= function() {
    if(arguments.length === 0) return this;
    var param = arguments[0], str= this;
    if(typeof(param) === 'object') {
        for(var key in param)
            str = str.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
        return str;
    } else {
        for(var i = 0; i < arguments.length; i++)
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return str;
    }
}


function companyTable(company,address,contacts,phone,remarks){
    var table ="<table class='table table-bordered table-block input-lg '>" +
                "<tr>" +
                 "<td class='nameBg'>公司名称</td>" +
                 "<td colspan='3'><a href='#'>{0}</a></td>".signMix(company)+
                "</tr><tr>" +
                 "<td class='nameBg'>公司地址</td>" +
                 "<td colspan='3'>{0}</td>".signMix(address) +
                "</tr><tr>" +
                 "<td class='nameBg'>联系人</td>" +
                 "<td>{0}</td>".signMix(contacts) +
                 "<td class='nameBg'>电话</td>" +
                 "<td>{0}</td>".signMix(phone) +
                "</tr><tr>" +
                 "<td class='nameBg'>备注</td>" +
                 "<td colspan='3'>{0}</td>".signMix(remarks) +
                "</tr></table>"
    return table
};

function addCompany(){
    var company = document.getElementById('company').value;
    var address = document.getElementById('address').value;
    var contacts = document.getElementById('contacts').value;
    var phone = document.getElementById('phone').value;
    var remarks = document.getElementById('remarks').value;
    if(company!='')
    {
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM company WHERE company=?',
            [company], function (tx, results) {
                var len = results.rows.length, i;
                if(len == '1')
                {
                    msg = '该用户已添加！';
                    document.querySelector('#msg').innerHTML =  msg;
                }
                else
                {
                    user_id = sessionStorage.getItem('user_id')
                    tx.executeSql("INSERT INTO company(user_id,company,address,contacts,phone,remarks) values (?,?,?,?,?,?)",
                                   [user_id,company,address,contacts,phone,remarks]);
                    msg = '<p>客户添加成功！</p>';
                    document.querySelector('#msg').innerHTML =  msg;
                    window.location.href="company.html";
                };

            });
        });
    }
    else
    {
        msg = '公司名称不能为空！';
        document.querySelector('#msg').innerHTML =  msg;
    }
};