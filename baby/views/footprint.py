import math
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from .auth import login_required
from baby.db import get_db
from baby.model.baby_model import BabyModel
from baby.model.file_model import FileModel
bp = Blueprint('footprint', __name__)
baby_model = BabyModel()


@bp.route('/footprint')
@login_required
def footprint():
    footprints = baby_model.get_footprint(get_db(), g.user['id'], g.baby['id'])
    return render_template('footprint/footprint.html', footprints=footprints)


@bp.route('/footprint/<int:footprint_id>/detail/page/<int:page>/page_size/<int:page_size>')
@login_required
def footprint_detail(footprint_id, page, page_size):
    footprint = get_db().execute('select * from manage_footprint where id=? ',
                                 (footprint_id,)).fetchone()
    photo = get_db().execute('select * from manage_album where footprint=? and is_deleted=0'
                             ' and baby_id=? order by id desc limit ?,?',
                             (footprint_id, g.baby['id'],
                              (page-1)*page_size, page_size)).fetchall()
    count = get_db().execute('select count(1) as count from manage_album '
                             ' where is_deleted=0 and footprint=? and baby_id=?',
                             (footprint_id, g.baby['id'])).fetchone()
    page = {'page': page, 'page_size': page_size, 'all_page': math.ceil(count['count']/page_size),
            'page_count': len(photo), 'count': count['count']}

    return render_template('footprint/footprint_detail.html',
                           footprint=footprint,
                           photo=photo,
                           page=page)


@bp.route('/add/footprint', methods=('POST',))
@login_required
def add_footprint():
    file_model = FileModel(g.config['upload_path'])
    if request.method == 'POST':
        record_date = request.form['record_date']
        footprint_name = request.form['footprint_name']
        footprint_desc = request.form['footprint_desc']
        footprint_img = request.files['inputFile']
        error = None
        # upload_path = os.path.join(g.config['upload_path'], 'upload')
        results = file_model.upload_file(footprint_img,
                                         g.config['img_extensions'],
                                         g.config['video_extensions'])
        if results['status'] == 'success':
            footprint_img = '{}/{}'.format('upload/small/', results['filename'])
        else:
            error = results['msg']
            flash(error)

        if error is None:
            db = get_db()
            baby_model.add_footprint(db, g.user['id'], g.baby['id'], record_date,
                                     footprint_name, footprint_desc, footprint_img)
            return redirect(url_for('footprint.footprint'))


@bp.route('/update/<int:footprint_id>/footprint', methods=('POST', 'GET'))
@login_required
def update_footprint(footprint_id):
    file_model = FileModel(g.config['upload_path'])
    footprint_info = get_db().execute('select * from manage_footprint where id=?',
                                      (footprint_id,)).fetchone()
    if request.method == 'POST':
        record_date = request.form['record_date']
        footprint_name = request.form['footprint_name']
        footprint_desc = request.form['footprint_desc']
        footprint_img = request.files['inputFile']
        error = None
        if footprint_img:
            # upload_path = os.path.join(g.config['upload_path'], 'upload')
            results = file_model.upload_file(footprint_img,
                                             g.config['img_extensions'],
                                             g.config['video_extensions'])
            if results['status'] == 'success':
                footprint_img = '{}/{}'.format('upload/small/', results['filename'])
            else:
                error = results['msg']
                flash(error)
        else:
            footprint_img = footprint_info['footprint_img']

        if error is None:
            db = get_db()
            baby_model.update_footprint(db, footprint_id, record_date, footprint_name, footprint_desc, footprint_img)
            return redirect(url_for('footprint.footprint'))
    return render_template('footprint/footprint_update.html', footprint_info=footprint_info)
