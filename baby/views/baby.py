import os
import hashlib
import time
import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
# from werkzeug.exceptions import abort
# from werkzeug import secure_filename
from .auth import login_required
from baby.db import get_db
from baby.model.baby_model import BabyModel
bp = Blueprint('baby', __name__)
baby_model = BabyModel()


@bp.route('/home')
@login_required
def home():
    baby_healthy = baby_model.get_baby_healthy(get_db(), g.user['id'])
    baby_info = baby_model.get_baby_info(get_db(), g.user['id'])
    ages = []
    for baby in baby_info:
        birthday = baby['birthday']
        date1 = time.strptime(birthday, "%Y-%m-%d")
        date2 = time.strptime(datetime.datetime.now().strftime("%Y-%m-%d"), "%Y-%m-%d")
        age = "{}岁{}月{}天({}天)".format(date2.tm_year-date1.tm_year,
                                         date2.tm_mon-date1.tm_mon,
                                         date2.tm_mday-date1.tm_mday,
                                         date2.tm_yday-date1.tm_yday)
        info = {"id": baby['id'], "age": age}
        ages.append(info)
    return render_template('baby/home.html', baby_healthy=baby_healthy,
                           baby_info=baby_info, ages=ages)


@bp.route('/healthy/<int:healthy_id>/detail', methods=('POST', 'GET'))
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
        error = None
        if error is None:
            db = get_db()
            db.execute('update manage_healthy set record_date=?, weight=?, '
                       'height=?, remarks=? where id=?', (record_date, my_weight, my_height, remarks,healthy_id))
            db.commit()
            return redirect(url_for('baby.home'))
    return render_template('baby/healthy_detail.html', healthy=healthy)


@bp.route('/album/page/<int:page>/page_size/<int:page_size>')
@login_required
def album(page=1, page_size=6):
    photo = get_db().execute('select * from manage_album where is_deleted=0'
                             ' order by id desc limit ?,?',
                             ((page-1)*page_size, page_size)).fetchall()
    count = get_db().execute('select count(1) as count from manage_album '
                             ' where is_deleted=0').fetchone()
    page = {'page': page, 'page_size': page_size,
            'page_count': len(photo), 'count': count['count']}
    return render_template('baby/album.html', photo=photo, page=page)


@bp.route('/album/<int:album_id>/detail')
@login_required
def album_detail(album_id):
    photo = get_db().execute('select * from manage_album  where id=?',
                             (album_id,)).fetchone()
    footprint = get_db().execute('select * from manage_footprint where id = '
                                 '(select footprint from manage_album where id=?)',
                                 (album_id,)).fetchone()
    return render_template('baby/album_detail.html', photo=photo, footprint=footprint)


@bp.route('/album/<int:album_id>/update', methods=('POST', 'GET'))
@login_required
def album_update(album_id):
    footprints = baby_model.get_footprint(get_db(), g.user['id'])
    photo = get_db().execute('select * from manage_album where id=?',
                             (album_id,)).fetchone()
    if request.method == 'POST':
        record_date = request.form['recordDate']
        footprint = request.form['footprint']
        title = request.form['title']
        body = request.form['body']
        error = None
        if error is None:
            db = get_db()
            db.execute('update manage_album set title=?,body=?,footprint=?,'
                       'record_date=? where id=?',
                       (title, body, footprint, record_date, album_id))
            db.commit()
            return redirect(url_for('baby.album'))
    return render_template('baby/album_update.html', footprints=footprints, photo=photo)


@bp.route('/album/<int:album_id>/delete', methods=('POST',))
@login_required
def album_delete(album_id):
    if request.method == 'POST':
        get_db().execute('update manage_album set is_deleted=1 where id=?', (album_id,))
        get_db().commit()
        return redirect(url_for('baby.album'))


@bp.route('/mine')
@login_required
def mine():
    db = get_db()
    baby_info = baby_model.get_baby_info(db, g.user['id'])
    return render_template('baby/mine.html', baby_info=baby_info)


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
        birthday = request.form['birthday']
        error = None
        if error is None:
            db = get_db()
            db.execute('insert into relative (call_name, really_name, birthday) values(?,?,?)',
                       (call_name, really_name, birthday))
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
        birthday = request.form['birthday']
        error = None
        if error is None:
            db = get_db()
            db.execute('update relative set call_name=?, really_name=?, birthday=? where id=?',
                       (call_name, really_name, birthday, relative_id))
            db.commit()
            return redirect(url_for('baby.relative'))
    return render_template('baby/mine_relative_detail.html', relative=my_relative)


@bp.route('/footprint')
@login_required
def footprint():
    footprints = baby_model.get_footprint(get_db(), g.user['id'])
    return render_template('baby/footprint.html', footprints=footprints)


@bp.route('/footprint/<int:footprint_id>/detail/page/<int:page>/page_size/<int:page_size>')
@login_required
def footprint_detail(footprint_id, page, page_size):
    footprint = get_db().execute('select * from manage_footprint where id=? ',
                                 (footprint_id,)).fetchone()
    photo = get_db().execute('select * from manage_album where footprint=? and is_deleted=0'
                             ' order by id desc limit ?,?',
                             (footprint_id, (page-1)*page_size, page_size)).fetchall()
    count = get_db().execute('select count(1) as count from manage_album '
                             ' where is_deleted=0 and footprint=?',
                             (footprint_id,)).fetchone()
    page = {'page': page, 'page_size': page_size,
            'page_count': len(photo), 'count': count['count']}

    return render_template('baby/footprint_detail.html',
                           footprint=footprint,
                           photo=photo,
                           page=page)


@bp.route('/diary/page/<int:page>/page_size/<int:page_size>')
@login_required
def diary(page, page_size):
    baby_diary = get_db().execute('select * from manage_diary where create_by = ? '
                                  ' and is_deleted=0 order by record_date desc '
                                  ' limit ?,?', (g.user['id'], (page-1)*page_size, page_size)).fetchall()
    count = get_db().execute('select count(1) as count '
                             ' from manage_diary').fetchone()
    page = {'page': page, 'page_size': page_size,
            'page_count': len(baby_diary), 'count': count['count']}
    return render_template('baby/diary.html',
                           baby_diary=baby_diary,
                           page=page)


@bp.route('/diary/<int:diary_id>/update', methods=('GET', 'POST'))
@login_required
def update_diary(diary_id):
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
            return redirect(url_for('baby.diary', page=1, page_size=5))
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


@bp.route('/update/baby/<int:baby_id>/information', methods=('GET', 'POST'))
@login_required
def update_baby_info(baby_id):
    baby_info = get_db().execute('select * from baby_info where id=?',
                                 (baby_id,)).fetchone()
    if request.method == 'POST':
        return redirect(url_for('baby.home'))
    return render_template('baby/baby_detail.html', baby_info=baby_info)


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
        footprint_img = request.files['inputFile']
        error = None
        upload_path = os.path.join(g.config['upload_path'], 'upload')
        results = upload_file(upload_path, footprint_img)
        if results.get('status') == 'success':
            filename = results.get('filename')
        else:
            error = results.get('msg')
            flash(error)

        if error is None:
            db = get_db()
            baby_model.add_footprint(db, g.user['id'], record_date, footprint_name, footprint_desc, filename)
            return redirect(url_for('baby.mine'))


@bp.route('/update/<int:footprint_id>/footprint', methods=('POST','GET'))
@login_required
def update_footprint(footprint_id):
    footprint_info = get_db().execute('select * from manage_footprint where id=?',
                                      (footprint_id,)).fetchone()
    if request.method == 'POST':
        record_date = request.form['record_date']
        footprint_name = request.form['footprint_name']
        footprint_desc = request.form['footprint_desc']
        footprint_img = request.files['inputFile']
        error = None
        if footprint_img:
            upload_path = os.path.join(g.config['upload_path'], 'upload')
            results = upload_file(upload_path, footprint_img)
            if results.get('status') == 'success':
                footprint_img = '{}/{}'.format('upload', results.get('filename'))
            else:
                error = results.get('msg')
                flash(error)
        else:
            footprint_img = footprint_info['footprint_img']

        if error is None:
            db = get_db()
            baby_model.update_footprint(db, footprint_id, record_date, footprint_name, footprint_desc, footprint_img)
            return redirect(url_for('baby.footprint'))
    return render_template('baby/footprint_update.html', footprint_info=footprint_info)


def allowed_file(filename):
    img_extensions = g.config['img_extensions']
    video_extensions = g.config['video_extensions']
    file_type = None
    if '.' in filename and filename.rsplit('.', 1)[-1] in img_extensions:
        file_type = 0
    if '.' in filename and filename.rsplit('.', 1)[-1] in video_extensions:
        file_type = 1
    return file_type


def upload_file(upload_path, file):
    results = {'msg': '', 'status': '', 'filename': ''}
    file_type = allowed_file(file.filename)
    if file and file_type is not None:
        file_extensions = file.filename.rsplit('.', 1)[-1]
        now_time = str(time.time()).split('.')[0]
        filename = '{}-{}.{}'.format(now_time, my_md5(now_time), file_extensions)
        try:
            file.save(os.path.join(upload_path, filename))
            results['status'] = 'success'
            results['msg'] = '上传成功'
            results['filename'] = filename
            results['file_type'] = file_type
        except OSError as e:
            results['status'] = 'error'
            results['msg'] = e
    else:
        results['status'] = 'error'
        results['msg'] = '上传文件必须是{}等格式'.format(str(g.config['img_extensions']))
    return results


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
        error = None
        upload_path = os.path.join(g.config['upload_path'], 'upload')
        results = upload_file(upload_path, file)
        if results.get('status') == 'success':
            img_path = '{}/{}'.format('upload', results.get('filename'))
            file_type = results.get('file_type')
        else:
            error = results.get('msg')
            flash(error)
        if error is None:
            db = get_db()
            db.execute('insert into manage_album (baby_id,title,body,footprint,'
                       'img_path,record_date,create_by,file_type) '
                       'values(?,?,?,?,?,?,?,?)',
                       (baby_id, title, body, footprint,
                        img_path, record_date, g.user['id'], file_type))
            db.commit()
            error = 'Success'
            flash(error)
            return redirect(url_for('baby.upload'))
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


def my_md5(string):
    h = hashlib.md5()
    h.update(string.encode(encoding='utf-8'))
    return h.hexdigest()
