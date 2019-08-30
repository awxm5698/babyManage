import math
import hashlib
import time
import datetime
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from .auth import login_required
from baby.db import get_db
from baby.model.baby_model import BabyModel
bp = Blueprint('baby', __name__)
baby_model = BabyModel()


@bp.route('/home')
@login_required
def home():
    if g.baby:
        baby_healthy = baby_model.get_baby_healthy(get_db(), g.baby['id'])
        baby_info = get_db().execute('select * from baby_info where user_id=?',
                                     (g.user['id'],)).fetchall()
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
        return render_template('baby/baby_home.html', baby_healthy=baby_healthy,
                               baby_info=baby_info, ages=ages)
    else:
        return render_template('baby/baby_home.html')


@bp.route('/healthy/<int:healthy_id>/detail', methods=('POST', 'GET'))
@login_required
def update_healthy(healthy_id):
    healthy = get_db().execute('select * from manage_healthy where id=?',
                               (healthy_id,)).fetchone()
    if request.method == 'POST':
        record_date = request.form['record_date']
        my_weight = request.form['weight']
        my_height = request.form['height']
        remarks = request.form['remarks']
        error = None
        if error is None:
            db = get_db()
            db.execute('update manage_healthy set record_date=?, weight=?, '
                       'height=?, remarks=? where id=?',
                       (record_date, my_weight, my_height, remarks, healthy_id))
            db.commit()
            return redirect(url_for('baby.home'))
    return render_template('baby/baby_healthy_update.html', healthy=healthy)


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
            return redirect(url_for('mine.mine'))
    return render_template('baby/baby_detail.html')


@bp.route('/update/baby/<int:baby_id>/information', methods=('GET', 'POST'))
@login_required
def update_baby_info(baby_id):
    baby_info = get_db().execute('select * from baby_info where id=?',
                                 (baby_id,)).fetchone()
    if request.method == 'POST':
        return redirect(url_for('baby.home'))
    return render_template('baby/baby_detail.html', baby_info=baby_info)


@bp.route('/add/healthy', methods=('GET', 'POST'))
@login_required
def add_baby_healthy():
    if request.method == 'POST':
        record_date = request.form['record_date']
        my_weight = request.form['my_weight']
        my_height = request.form['my_height']
        remarks = request.form['remarks']
        error = None
        if error is None:
            db = get_db()
            baby_model.add_baby_healthy(db, g.user['id'], g.baby['id'],
                                        record_date, my_weight, my_height, remarks)
            return redirect(url_for('mine.mine'))
    return render_template('baby/healthy_detail.html')


@bp.route('/baby/default', methods=('POST', ))
@login_required
def set_default_baby():
    if request.method == 'POST':
        baby_id = request.form['baby']
        get_db().execute('update baby_info set is_default=1 where id=?', (baby_id,))
        get_db().commit()
        another_baby = get_db().execute('select * from baby_info where id<>?',
                                        (baby_id,)).fetchone()
        if another_baby:
            get_db().execute('update baby_info set is_default=0 '
                             ' where id<>? and user_id=?', (baby_id, g.user['id']))
            get_db().commit()
        return redirect(url_for('baby.home'))
