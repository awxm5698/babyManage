document.write("<script  src='../static/js/format.js'></script>");

function companyTable(company,address,contacts,phone,remarks){
    var table = "<tr>" +
                 "<td class='nameBg'>公司名称</td>" +
                 "<td colspan='3' class='text-left'>{0}<button class='btn btn-info' style='position:absolute;left:300px;' onclick='getCompanyDetail(\"{1}\")'>编辑</button>".replaceValue(company,company)+"</td>"+
                "</tr><tr>" +
                 "<td class='nameBg'>公司地址</td>" +
                 "<td colspan='3' class='text-left'>{0}</td>".replaceValue(address) +
                "</tr><tr>" +
                 "<td class='nameBg'>联系人</td>" +
                 "<td>{0}</td>".replaceValue(contacts) +
                 "<td class='nameBg'>电话</td>" +
                 "<td>{0}</td>".replaceValue(phone) +
                "</tr><tr>" +
                 "<td class='nameBg'>备注</td>" +
                 "<td colspan='3' class='text-left'>{0}</td>".replaceValue(remarks) +
                "</tr>"
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
function updateCompany(companyId){
    var company = document.getElementById('new_company').value;
    var address = document.getElementById('new_address').value;
    var contacts = document.getElementById('new_contacts').value;
    var phone = document.getElementById('new_phone').value;
    var remarks = document.getElementById('new_remarks').value;
    sql = "UPDATE company set company=?,address=?,contacts=?,phone=?,remarks=? where id=?"
    db.transaction(function (tx) {
        tx.executeSql(sql ,[company,address,contacts,phone,remarks,companyId]);
        updateCompanyRemove();
        clickSearch();
    });
};

function updateCompanyRemove(){
    document.querySelector('#updateCompany').remove();
    document.getElementsByTagName("body").className='';
};

function deleteCompany(id){
    sql = "delete from company where id='"+id+"'";
    doExecuteSql(sql);
    updateCompanyRemove();
    clickSearch();
}

function getCompanyDetail(company){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM company WHERE company=?',
        [company], function (tx, results) {
            var len = results.rows.length, i;
            var id = results.rows.item(0).id
            var company = results.rows.item(0).company
            var address = results.rows.item(0).address
            var contacts = results.rows.item(0).contacts
            var phone = results.rows.item(0).phone
            var remarks = results.rows.item(0).remarks
            modal = companyDetail(id,company,address,contacts,phone,remarks)
            document.querySelector('#companyDetail').innerHTML =  modal;
            document.getElementsByTagName("body").className='modal-open'
        });
    });
};

function companyDetail(id,company,address,contacts,phone,remarks){
    modal = '<div class="modal fade in" id="updateCompany" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: block;"' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
                            '<h4 class="modal-title" id="myModalLabel">客户资料</h4>' +
                        '</div>' +
                        '<div id="msg" class="text-center"></div>' +
                        '<form class="form-horizontal" style="margin:20px 10px 10px" method="post" action="#" >' +
                            '<div class="form-group">' +
                                '<label for="new_company" class="col-xs-4 input-lg">公司名</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="text" class="form-control input-lg" placeholder="请输入公司名称" name="new_company" id="new_company" value="'+company+'"/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_address" class="col-xs-4 input-lg">公司地址</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="text" class="form-control input-lg" placeholder="请输入公司地址" name="new_address" id="new_address" value="'+address+'"/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_contacts" class="col-xs-4 input-lg">联系人</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="text" class="form-control input-lg" placeholder="联系人姓名" name="new_contacts" id="new_contacts" value="'+contacts+'"/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_phone" class="col-xs-4 input-lg">联系电话</label>' +
                                '<div class="col-xs-8">' +
                                    '<input type="text" class="form-control input-lg" placeholder="请输入电话号码" name="new_phone" id="new_phone" value="'+phone+'"/>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="new_remarks" class="col-xs-4 input-lg">备注</label>' +
                                '<div class="col-xs-8">' +
                            '<textarea class="form-control input-lg" placeholder="备注" name="new_remarks" id="new_remarks">'+ remarks +'</textarea>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group text-center">' +
                                '<button type="button" class="btn btn-danger btn-lg margin-0-10-0" onclick=deleteCompany("'+id+'")>删除</button>' +
                                '<button type="button" class="btn btn-default btn-lg margin-0-10-0" onclick=updateCompanyRemove() >关闭</button>' +
                                '<button type="button" class="btn btn-primary btn-lg margin-0-10-0" onclick=updateCompany("'+id+'")>提交</button>' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                '</div>' +
            '</div>'
    return modal
};

function clickSearch(){
        var searchText = document.getElementById('searchText').value;
        searchCompany(searchText);
    };

function resetText(){
    searchText = document.getElementById('searchText').value = "";
    searchCompany();
};

function getSearchCompanySql(searchText){
    if(searchText==""){
        sql = 'SELECT * FROM company WHERE user_id=?'
    }
    else
    {
        sql = "SELECT * FROM company WHERE user_id=? and (company like '%"+searchText+"%'" +
        " or contacts like '%"+searchText+"%'" + " or phone like '%"+searchText+"%')"
    }
    return sql
};

function searchCompany(searchText=""){
    sql = getSearchCompanySql(searchText);
    user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
        tx.executeSql(sql, [user_id], function (tx, results) {
            var len = results.rows.length, i;
            if(len==0)
                {
                    btn = '<p>你还没有客户呢，赶紧添加吧！</p>'+
                        '<button class="btn btn-default btn-lg" data-toggle="modal" data-target="#addCompany">添加客户</button>'
                    document.querySelector('#center').innerHTML =  btn;
                }
                else
                {
                    table = "<table class='table table-bordered table-block input-lg'  id='companyTable'>"
                    for(i=0;i<len;i++){
                        var company = results.rows.item(i).company
                        var address = results.rows.item(i).address
                        var contacts = results.rows.item(i).contacts
                        var phone = results.rows.item(i).phone
                        var remarks = results.rows.item(i).remarks
                        table = table + companyTable(company,address,contacts,phone,remarks)
                        if(i<len-1){
                            table = table + "<tr><td colspan='4'></td></tr>"
                        };
                    };
                    table = table + "</table>";
                    document.querySelector('#center').innerHTML =  table;
                };
        }, null);
    });
};

function exportCompany(fileName){
    searchText = document.getElementById('searchText').value = "";
    sql = getSearchCompanySql(searchText);
    user_id = sessionStorage.getItem('user_id')
    db.transaction(function (tx) {
      tx.executeSql(sql, [user_id], function (tx, results) {
          var len = results.rows.length, i;
          table = '<table class="table table-bordered table-block input-lg" id="exportTable">' +
                        "<tr>" +
                            "<td>公司名称</td>" +
                            "<td>公司地址</td>" +
                            "<td>联系人</td>" +
                            "<td>电话</td>" +
                            "<td>备注</td>" +
                        "</tr>"
          for(i=0;i<len;i++){
              var company = results.rows.item(i).company
              var address = results.rows.item(i).address
              var contacts = results.rows.item(i).contacts
              var phone = results.rows.item(i).phone
              var remarks = results.rows.item(i).remarks
              table = table + exportTable(company,address,contacts,phone,remarks)
          };
          table = table + "</table>";
          document.querySelector('#export').innerHTML =  table;
          downloadExcel("exportTable",fileName)
          document.getElementById('exportTable').remove();

      }, null);
    });
};

function exportTable(company,address,contacts,phone,remarks){
    table = "<tr>" +
                "<td>{0}</td>".replaceValue(company) +
                "<td>{0}</td>".replaceValue(address) +
                "<td>{0}</td>".replaceValue(contacts) +
                "<td>{0}</td>".replaceValue(phone) +
                "<td>{0}</td>".replaceValue(remarks) +
            "</tr>"
    return table
}