import math
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from .auth import login_required
from baby.db import get_db
from baby.model.baby_model import BabyModel
bp = Blueprint('diary', __name__)
baby_model = BabyModel()


@bp.route('/diary/page/<int:page>/page_size/<int:page_size>')
@login_required
def diary(page, page_size):
    if g.baby:
        baby_diary = get_db().execute('select * from manage_diary where baby_id = ? '
                                      ' and is_deleted=0 order by record_date desc '
                                      ' limit ?,?', (g.baby['id'], (page-1)*page_size, page_size)).fetchall()
        count = get_db().execute('select count(1) as count from manage_diary where baby_id=?',
                                 (g.baby['id'],)).fetchone()
        page = {'page': page, 'page_size': page_size, 'all_page': math.ceil(count['count']/page_size),
                'page_count': len(baby_diary), 'count': count['count']}
        return render_template('diary/diary.html',
                               baby_diary=baby_diary,
                               page=page)
    else:
        page = {'page': 1, 'page_size': 1, 'all_page': 1,
                'page_count': 0, 'count': 0}
        return render_template('diary/diary.html',page=page)


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
            return redirect(url_for('diary.diary', page=1, page_size=5))
    return render_template('diary/diary_detail.html', diary=diary)


@bp.route('/add/diary', methods=('GET', 'POST'))
@login_required
def add_baby_diary():
    if request.method == 'POST':
        record_date = request.form['record_date']
        diary = request.form['diary']
        record_by = request.form['recordBy']
        error = None
        if error is None:
            db = get_db()
            baby_model.add_baby_diary(db, g.user['id'], g.baby['id'], record_date, diary, record_by)
            return redirect(url_for('diary.diary',
                                    page=1,
                                    page_size=5))
