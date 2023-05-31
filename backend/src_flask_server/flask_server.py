from flask import Flask, current_app

from redis import Redis

from psycopg2 import connect
from psycopg2.extensions import connection, cursor
from psycopg2.extras import DictCursor

from typing import Union


def create_db(connection_string) -> Union[None, connection]:
    con = connect(connection_string)
    if con.closed:
        print("Error trying to connect db.")
        return None
    
    return con

def get_db() -> connection:
    return current_app.db

def get_cursor() -> cursor:
    db: connection = current_app.db
    return db.cursor(cursor_factory=DictCursor)

def get_redis() -> Redis:
    return current_app.redis

def create_app() -> Flask:
    app    = Flask(__name__, static_folder="flask_bps/templates/static_home")
    # app.config.from_mapping(
    #     SECRET_KEY="verycomplicated",
    #     PERMANENT_SESSION_LIFETIME=timedelta(days=5),
    #     DATABASE="postgresql://vmachine:vmachine@10.5.0.3"
    # )
    app.config.from_object('config')
    app.db    = create_db(app.config["DATABASE"])
    app.redis = Redis(host=app.config["REDIS_HOST"], port=app.config["REDIS_PORT"])

    #checking redis
    if not app.redis.ping():
        app.db.close()
        raise Exception("Redis is not connected.")

    from flask_bps import auth
    from flask_bps import home
    app.register_blueprint(auth.bp)
    app.register_blueprint(home.bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0',port=8064,debug=True)