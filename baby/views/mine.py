from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from .auth import login_required
from baby.db import get_db
from baby.model.baby_model import BabyModel
bp = Blueprint('mine', __name__)
baby_model = BabyModel()


@bp.route('/mine')
@login_required
def mine():
    db = get_db()
    baby_info = baby_model.get_baby_info(db, g.user['id'])
    return render_template('mine/mine.html', baby_info=baby_info)


@bp.route('/relative')
@login_required
def relative():
    my_relative = get_db().execute('select * from relative where baby_id=?',
                                   (g.baby['id'],)).fetchall()
    return render_template('mine/mine_relative.html', relative=my_relative)


@bp.route('/relative/add', methods=('POST',))
@login_required
def add_relative():
    if request.method == 'POST':
        call_name = request.form['call_name']
        really_name = request.form['really_name']
        birthday = request.form['birthday']
        error = None
        if error is None:
            db = get_db()
            db.execute('insert into relative (baby_id, call_name,'
                       ' really_name, birthday) values(?,?,?)',
                       (g.baby['id'], call_name, really_name, birthday))
            db.commit()
            return redirect(url_for('mine.relative'))


@bp.route('/relative/<int:relative_id>/update', methods=('POST','GET'))
@login_required
def update_relative(relative_id):
    my_relative = get_db().execute('select * from relative where id=?',
                                   (relative_id,)).fetchone()
    if request.method == 'POST':
        call_name = request.form['call_name']
        really_name = request.form['really_name']
        birthday = request.form['birthday']
        error = None
        if error is None:
            db = get_db()
            db.execute('update relative set call_name=?, really_name=?, birthday=? where id=?',
                       (call_name, really_name, birthday, relative_id))
            db.commit()
            return redirect(url_for('mine.relative'))
    return render_template('mine/mine_relative_detail.html', relative=my_relative)


@bp.route('/config', methods=('GET',))
@login_required
def config():
    configs = get_db().execute('select * from config').fetchall()
    return render_template('mine/config.html', configs=configs)


@bp.route('/config/add', methods=('POST',))
@login_required
def add_config():
    if request.method == 'POST':
        config_key = request.form['configKey']
        config_value = request.form['configValue']
        remarks = request.form['remarks']
        error = None
        if error is None:
            get_db().execute('insert into config(key,value,remarks) values(?,?,?)',
                             (config_key, config_value, remarks))
            get_db().commit()
        return redirect(url_for('mine.config'))


@bp.route('/config/<int:config_id>/update', methods=('POST', 'GET'))
@login_required
def update_config(config_id):
    this_config = get_db().execute('select * from config where id=?',
                                   (config_id,)).fetchone()
    if request.method == 'POST':
        config_key = request.form['configKey']
        config_value = request.form['configValue']
        remarks = request.form['remarks']

        error = None
        if error is None:
            get_db().execute('update config set key=?,value=?,remarks=? where id=?',
                             (config_key, config_value, remarks, config_id))
            get_db().commit()
        return redirect(url_for('mine.config'))
    return render_template('mine/config_detail.html', this_config=this_config)


@bp.route('/config/<int:config_id>/delete', methods=('POST',))
@login_required
def delete_config(config_id):
    if request.method == 'POST':
        error = None
        if error is None:
            get_db().execute('delete from config where id=?',
                             (config_id,))
            get_db().commit()
            return redirect(url_for('mine.config'))
