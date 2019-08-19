import os
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from werkzeug import secure_filename
from .auth import login_required
from baby.db import get_db
from baby.model.baby_model import BabyModel
bp = Blueprint('baby', __name__)
baby_model = BabyModel()


@bp.route('/home')
@login_required
def home():
    baby_healthy = baby_model.get_baby_healthy(get_db(), g.user['id'])
    img_name = 'upload/a1.jpg'
    return render_template('baby/home.html', baby_healthy=baby_healthy, img_name=img_name)


@bp.route('/healthy/<int:healthy_id>/detail', methods=('POST','GET'))
@login_required
def update_healthy(healthy_id):
    healthy = get_db().execute('select * from manage_healthy where id=?',
                               (healthy_id,)).fetchone()
    baby_id = 1
    if request.method == 'POST':
        record_date = request.form['record_date']
        my_weight = request.form['weight']
        my_height = request.form['height']
        remarks = request.form['remarks']
        print(record_date, diary)
        error = None
        if error is None:
            db = get_db()
            db.execute('update manage_healthy set record_date=?, weight=?, '
                       'height=?, remarks=? where id=?', (record_date, my_weight, my_height, remarks,healthy_id))
            db.commit()
            return redirect(url_for('baby.home'))
    return render_template('baby/healthy_detail.html', healthy=healthy)


@bp.route('/album')
@login_required
def album():
    photo = get_db().execute('select * from manage_album order by record_date desc').fetchall()
    return render_template('baby/album.html', photo=photo)


@bp.route('/mine')
@login_required
def mine():
    user = {'name': '宝宝', 'address': '深圳龙华'}
    db = get_db()
    baby_info = baby_model.get_baby_info(db, g.user['id'])
    return render_template('baby/mine.html', user=user, baby_info=baby_info)


@bp.route('/relative')
@login_required
def relative():
    my_relative = get_db().execute('select * from relative').fetchall()
    return render_template('baby/mine_relative.html', relative=my_relative)


@bp.route('/relative/add', methods=('POST',))
@login_required
def add_relative():
    if request.method == 'POST':
        call_name = request.form['call_name']
        really_name = request.form['really_name']
        error = None
        if error is None:
            db = get_db()
            db.execute('insert into relative (call_name, really_name) values(?,?)',
                       (call_name, really_name))
            db.commit()
            return redirect(url_for('baby.relative'))


@bp.route('/relative/<int:relative_id>/update', methods=('POST','GET'))
@login_required
def update_relative(relative_id):
    my_relative = get_db().execute('select * from relative where id=?',
                                   (relative_id,)).fetchone()
    if request.method == 'POST':
        call_name = request.form['call_name']
        really_name = request.form['really_name']
        error = None
        if error is None:
            db = get_db()
            db.execute('update relative set call_name=?, really_name=? where id=?',
                       (call_name, really_name, relative_id))
            db.commit()
            return redirect(url_for('baby.relative'))
    return render_template('baby/mine_relative_detail.html', relative=my_relative)


@bp.route('/footprint')
@login_required
def footprint():
    footprints = baby_model.get_footprint(get_db(), g.user['id'])
    return render_template('baby/footprint.html', footprints=footprints)


@bp.route('/footprint/<int:footprint_id>/detail')
@login_required
def footprint_detail(footprint_id):
    footprint = get_db().execute('select * from manage_footprint where id=?',
                                 (footprint_id,)).fetchone()
    photo = get_db().execute('select * from manage_album where footprint=?',
                             (footprint_id,)).fetchall()
    return render_template('baby/footprint_detail.html', footprint=footprint, photo=photo)


@bp.route('/diary')
@login_required
def diary():
    baby_diary = baby_model.get_baby_diary(get_db(), g.user['id'])
    return render_template('baby/diary.html', baby_diary=baby_diary)


@bp.route('/diary/<int:diary_id>/update', methods=('GET', 'POST'))
@login_required
def diary_update(diary_id):
    diary = get_db().execute('select * from manage_diary where id=?',
                             (diary_id,)).fetchone()
    if request.method == 'POST':
        record_date = request.form['record_date']
        diary = request.form['diary']
        error = None
        if error is None:
            db = get_db()
            db.execute('update manage_diary set record_date=?, diary=? where id=?',
                       (record_date, diary, diary_id))
            db.commit()
            return redirect(url_for('baby.diary'))
    return render_template('baby/diary_detail.html', diary=diary)


@bp.route('/add/baby/information', methods=('GET', 'POST'))
@login_required
def add_baby_info():
    if request.method == 'POST':
        baby_name = request.form['babyName']
        birthday = request.form['birthday']
        baby_sex = request.form['babySex']
        introduce = request.form['introduce']
        error = None

        if error is None:
            db = get_db()
            baby_model.add_baby(db, g.user['id'], baby_name, baby_sex, birthday, introduce)
            return redirect(url_for('baby.mine'))
    return render_template('baby/baby_detail.html')


@bp.route('/add/diary', methods=('GET', 'POST'))
@login_required
def add_baby_diary():
    baby_id = 1
    if request.method == 'POST':
        record_date = request.form['record_date']
        diary = request.form['diary']
        record_by = request.form['recordBy']
        error = None
        if error is None:
            db = get_db()
            baby_model.add_baby_diary(db, g.user['id'], baby_id, record_date, diary, record_by)
            return redirect(url_for('baby.mine'))


@bp.route('/add/healthy', methods=('GET', 'POST'))
@login_required
def add_baby_healthy():
    baby_id = 1
    if request.method == 'POST':
        record_date = request.form['record_date']
        my_weight = request.form['my_weight']
        my_height = request.form['my_height']
        remarks = request.form['remarks']
        print(record_date, diary)
        error = None
        if error is None:
            db = get_db()
            baby_model.add_baby_healthy(db, g.user['id'], baby_id,
                                        record_date, my_weight, my_height, remarks)
            return redirect(url_for('baby.mine'))
    return render_template('baby/healthy_detail.html')


@bp.route('/add/footprint', methods=('POST',))
@login_required
def add_footprint():
    if request.method == 'POST':
        record_date = request.form['record_date']
        footprint_name = request.form['footprint_name']
        footprint_desc = request.form['footprint_desc']

        error = None
        if error is None:
            db = get_db()
            baby_model.add_footprint(db, g.user['id'], record_date, footprint_name, footprint_desc)
            return redirect(url_for('baby.mine'))


@bp.route('/upload', methods=('GET', 'POST'))
@login_required
def upload():
    footprints = baby_model.get_footprint(get_db(), g.user['id'])
    baby_id = 1
    if request.method == 'POST':
        record_date = request.form['recordDate']
        footprint = request.form['footprint']
        title = request.form['title']
        body = request.form['body']
        file = request.files['inputFile']
        filename = secure_filename(file.filename)
        file.save(os.path.join(g.config['upload_path'], 'upload', filename))
        error = None
        file_exist = get_db().execute('select * from manage_album where img_path=?',
                                      (filename,)).fetchone()
        if file_exist:
            error = '警告，该名称的照片已上传，请重新选择照片'
        if error is None:
            db = get_db()
            db.execute('insert into manage_album (baby_id,title,body,footprint,'
                       'img_path,record_date,create_by) '
                       'values(?,?,?,?,?,?,?)', (baby_id, title, body, footprint,
                                                 filename, record_date, g.user['id']))
            db.commit()
            error = 'Success'
        flash(error)
        return redirect(url_for('baby.upload', footprints=footprints))
    return render_template('baby/upload.html', footprints=footprints)


@bp.route('/config', methods=('GET',))
@login_required
def config():
    configs = get_db().execute('select * from config').fetchall()
    return render_template('baby/config.html', configs=configs)


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
        return redirect(url_for('baby.config'))


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
        return redirect(url_for('baby.config'))
    return render_template('baby/config_detail.html', this_config=this_config)


@bp.route('/config/<int:config_id>/delete', methods=('POST',))
@login_required
def delete_config(config_id):
    if request.method == 'POST':
        error = None
        if error is None:
            get_db().execute('delete from config where id=?',
                             (config_id,))
            get_db().commit()
            return redirect(url_for('baby.config'))
