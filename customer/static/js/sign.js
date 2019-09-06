
function register(){
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM user WHERE user_name=?',[username], function (tx, results) {
            var len = results.rows.length, i;
            if(len != '0')
            {
                msg = '<p>该用户已注册。</p>';
                document.querySelector('#msg').innerHTML =  msg;
            }
            else
            {
                password = hex_md5(password);
                tx.executeSql("INSERT INTO user(user_name,password) values (?,?)",
                              [username,password]);
                msg = '<p>用户注册成功！</p>';
                document.querySelector('#msg').innerHTML =  msg;
                window.location.href="../main.html";
            };

        });

    });
};

function signIn(){
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    password = hex_md5(password);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM user WHERE user_name=? and password=?',
        [username,password], function (tx, results) {
            var len = results.rows.length, i;
            if(len == '1')
            {
                msg = '<p>登录成功！</p>';
                sessionStorage.setItem('user_id',results.rows.item(0).id)
                sessionStorage.setItem('user_name',results.rows.item(0).user_name)
                window.location.href="templates/home.html";
            }
            else
            {
                msg = '<p>用户名或密码错误</p>';
            };
            document.querySelector('#msg').innerHTML =  msg;
        });

    });
};

function signOut(){
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_name');
    window.location.href="../main.html";
};

