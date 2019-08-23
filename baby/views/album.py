import math
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from .auth import login_required
from baby.db import get_db
from baby.model.baby_model import BabyModel
from baby.model.file_model import FileModel
bp = Blueprint('album', __name__)
baby_model = BabyModel()


@bp.route('/album/page/<int:page>/page_size/<int:page_size>')
@login_required
def album(page=1, page_size=6):
    if g.baby:
        photo = get_db().execute('select * from manage_album where is_deleted=0 '
                                 ' and baby_id=? order by id desc limit ?,?',
                                 (g.baby['id'], (page-1)*page_size, page_size)).fetchall()
        count = get_db().execute('select count(1) as count from manage_album '
                                 ' where is_deleted=0').fetchone()
        page = {'page': page, 'page_size': page_size, 'all_page': math.ceil(count['count']/page_size),
                'page_count': len(photo), 'count': count['count']}
        return render_template('album/album.html', photo=photo, page=page)
    else:
        page = {'page': 1, 'page_size': 1, 'all_page': 1,
                'page_count': 0, 'count': 0}
        return render_template('album/album.html', page=page)

@bp.route('/album/<int:album_id>/detail')
@login_required
def album_detail(album_id):
    photo = get_db().execute('select * from manage_album  where id=?',
                             (album_id,)).fetchone()
    footprint = get_db().execute('select * from manage_footprint where id = '
                                 '(select footprint from manage_album where id=?)',
                                 (album_id,)).fetchone()
    return render_template('album/album_detail.html', photo=photo, footprint=footprint)


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
            return redirect(url_for('album.album', page=1, page_size=6))
    return render_template('album/album_update.html', footprints=footprints, photo=photo)


@bp.route('/album/<int:album_id>/delete', methods=('POST',))
@login_required
def album_delete(album_id):
    if request.method == 'POST':
        get_db().execute('update manage_album set is_deleted=1 where id=?', (album_id,))
        get_db().commit()
        return redirect(url_for('album.album', page=1, page_size=6))


@bp.route('/upload', methods=('GET', 'POST'))
@login_required
def album_upload():
    file_model = FileModel(g.config['upload_path'])
    footprints = baby_model.get_footprint(get_db(), g.user['id'])
    baby_id = 1
    if request.method == 'POST':
        record_date = request.form['recordDate']
        footprint = request.form['footprint']
        title = request.form['title']
        body = request.form['body']
        file = request.files['inputFile']
        error = None
        # upload_path = os.path.join(g.config['upload_path'], 'upload')
        results = file_model.upload_file(file,
                                         g.config['img_extensions'],
                                         g.config['video_extensions'])
        if results['status'] == 'success':
            file_type = results['file_type']
            img_path = '{}/{}'.format('upload', results['filename'])
            small_img_path = ''
            large_img_path = ''
            if file_type == 0:
                small_img_path = '{}/{}'.format('upload/small/', results['filename'])
                large_img_path = '{}/{}'.format('upload/large/', results['filename'])
        else:
            error = results['msg']
            flash(error)
        if error is None:
            db = get_db()
            db.execute('insert into manage_album (baby_id,title,body,footprint,'
                       'img_path,small_img_path,large_img_path,record_date,'
                       'create_by,file_type) values(?,?,?,?,?,?,?,?,?,?)',
                       (baby_id, title, body, footprint,
                        img_path, small_img_path, large_img_path, record_date,
                        g.user['id'], file_type))
            db.commit()
            error = 'Success'
            flash(error)
            return redirect(url_for('album.album_upload'))
    return render_template('album/album_upload.html', footprints=footprints)