from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

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


@bp.route('/album')
@login_required
def album():
    return render_template('baby/album.html')


@bp.route('/mine')
@login_required
def mine():
    user = {'name': '宝宝', 'address': '深圳龙华'}
    db = get_db()
    baby_info = baby_model.get_baby_info(db, g.user['id'])
    return render_template('baby/mine.html', user=user, baby_info=baby_info)


@bp.route('/footprint')
@login_required
def footprint():
    footprints = baby_model.get_footprint(get_db(), g.user['id'])
    return render_template('baby/footprint.html', footprints=footprints)


@bp.route('/diary')
@login_required
def diary():
    baby_diary = baby_model.get_baby_diary(get_db(), g.user['id'])
    return render_template('baby/diary.html', baby_diary=baby_diary)


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
        error = None
        if error is None:
            db = get_db()
            baby_model.add_baby_diary(db, g.user['id'], baby_id, record_date, diary)
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

        print(footprint_desc, footprint_name, record_date)
        error = None
        if error is None:
            db = get_db()
            baby_model.add_footprint(db, g.user['id'], record_date, footprint_name, footprint_desc)
            return redirect(url_for('baby.mine'))

