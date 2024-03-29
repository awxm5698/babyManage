import os
from flask import Flask, render_template
from . import db
from .views import auth
from .views import baby
from .views import album
from .views import diary
from .views import footprint
from .views import mine
from .views import learn

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'baby.sqlite'),
        UPLOAD_PATH=os.path.join(app.instance_path, 'update')
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/')
    def index():
        # db = get_db()
        # posts = blog_model.get_all_posts(db)
        return render_template('auth/index.html')

    db.init_app(app)
    app.register_blueprint(auth.bp)
    app.register_blueprint(baby.bp)
    app.register_blueprint(album.bp)
    app.register_blueprint(diary.bp)
    app.register_blueprint(footprint.bp)
    app.register_blueprint(mine.bp)
    app.register_blueprint(learn.bp)
    app.add_url_rule('/', endpoint='index')

    return app
