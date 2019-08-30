import random
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from .auth import login_required
from baby.db import get_db
bp = Blueprint('learn', __name__)


@bp.route('/learn')
@login_required
def learn():
    return render_template('learn/learn.html')


@bp.route('/learn/<string:name>/knowledge')
@login_required
def learn_early(name):
    traffic = ['fa-ambulance', 'fa-car', 'fa-bicycle', 'fa-subway', 'fa-space-shuttle']
    chinese = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    if name == 'number':
        knowledge = chr(random.randint(48, 57))
    if name == 'letter':
        if random.randint(0, 1) == 0:
            knowledge = chr(random.randint(65, 90))
        else:
            knowledge = chr(random.randint(97, 122))
    if name == 'chinese':
        knowledge = random.choice(chinese)
    if name == 'traffic':
        knowledge = random.choice(traffic)

    return render_template('learn/learn_early.html', knowledge=knowledge)
