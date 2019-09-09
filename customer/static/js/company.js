document.write("<script  src='../static/js/format.js'></script>");

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
};

function deleteCompanyModalRemove(){
    document.querySelector('#deleteModal').remove();
};

function deleteCompany(id){
    sql = "delete from company where id='"+id+"'";
    doExecuteSql(sql);
    deleteCompanyModalRemove();
    updateCompanyRemove();
    clickSearch();
}

function getCompanyDeleteModal(company_id){
    modal = document.getElementById('companyDeleteDemo').innerHTML
    modal = modal.replaceValue('deleteModal',company_id)
    document.querySelector('#companyDelete').innerHTML =  modal;
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
            modal = document.getElementById('companyDetailDemo').innerHTML
            modal = modal.replaceValue(company,address,contacts,phone,remarks,id,"updateCompany")
            document.querySelector('#companyDetail').innerHTML =  modal;
//            document.getElementsByTagName("body").className='modal-open'
        });
    });
};


function clickSearch(){
        var searchText = document.getElementById('searchText').value;
        searchCompany(searchText);
        $('.modal').modal('hide')
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
                    btn = '<p>客户不存在，赶紧添加吧！</p>'+
                        '<button class="btn btn-default btn-lg" data-toggle="modal" data-target="#addCompany">添加客户</button>'
                    document.querySelector('#center').innerHTML =  btn;
                }
            else
                {
                    tableDemo = document.getElementById('companyTableDemo').innerHTML
                    table = ""
                    for(i=0;i<len;i++){
                        var company = results.rows.item(i).company
                        var address = results.rows.item(i).address
                        var contacts = results.rows.item(i).contacts
                        var phone = results.rows.item(i).phone
                        var remarks = results.rows.item(i).remarks
                        table = table + tableDemo.replaceValue(company,address,contacts,phone,remarks)
                    };
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
              table = table + exportCompanyTable(company,address,contacts,phone,remarks)
          };
          table = table + "</table>";
          document.querySelector('#export').innerHTML =  table;
          downloadExcel("exportTable",fileName)
          document.getElementById('exportTable').remove();

      }, null);
    });
};

function exportCompanyTable(company,address,contacts,phone,remarks){
    table = "<tr>" +
                "<td>{0}</td>" +
                "<td>{1}</td>" +
                "<td>{2}</td>" +
                "<td>{3}</td>" +
                "<td>{4}</td>" +
            "</tr>"
    table = table.replaceValue(company,address,contacts,phone,remarks)
    return table
}