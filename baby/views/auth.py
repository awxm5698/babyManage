import functools
import os
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash
from baby.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif db.execute(
                'SELECT id FROM user WHERE user_name = ? or email= ?', (username, email)
        ).fetchone() is not None:
            error = 'User {} is already registered.'.format(username)

        if error is None:
            db.execute(
                'INSERT INTO user (user_name, email, password) VALUES (?, ?, ?)',
                (username, email, generate_password_hash(password))
            )
            db.commit()
            return redirect(url_for('auth.login'))

        flash(error)

    return render_template('auth/register.html')


@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        print('user_name:{},password:{}'.format(username, password))
        db = get_db()
        error = None
        user = db.execute(
            'SELECT * FROM user WHERE user_name = ? or email = ?', (username, username)
        ).fetchone()

        if user is None:
            error = 'Incorrect username.'
        elif not check_password_hash(user['password'], password):
            error = 'Incorrect password.'

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            session['user_name'] = user['user_name']
            return redirect(url_for('baby.mine'))

        flash(error)

    return render_template('auth/index.html')


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()


@bp.before_app_request
def load_config():
    g.config = {}
    configs = get_db().execute('select * from config').fetchall()
    for config in configs:
        g.config[config['key']] = config['value']
    new_upload_path = os.path.join(get_current_path(), 'static')
    if new_upload_path != g.config['upload_path']:
        get_db().execute("update config set value=? where key='upload_path'",
                         (new_upload_path,))
        get_db().commit()
        load_config()


def get_current_path():
    current_path = os.path.split(os.path.realpath(__file__))[0]
    path = os.path.dirname(current_path)
    return path


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view
