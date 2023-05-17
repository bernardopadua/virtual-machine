from flask import Blueprint, render_template, session
from flask_bps.auth import should_be_logged

bp = Blueprint('home', __name__, url_prefix="/", template_folder="templates", static_folder="templates/static_home")

@bp.route("/")
@should_be_logged
def index():
    return render_template('index.html', token=session["user_token"])
