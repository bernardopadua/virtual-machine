from flask import (
    Blueprint, render_template, 
    request, jsonify, session, 
    redirect, url_for, current_app
)
from flask_server import get_db, get_cursor, get_redis
from redis_constants import USER_SESSION_WEBSOCKET

from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from functools import wraps
import hashlib, time, base64, json

bp = Blueprint('auth', __name__, url_prefix="/auth", template_folder="templates", static_folder="templates/static")

def should_be_logged(func):
    @wraps(func)
    def check_login(*args, **kwargs):
        try:
            if not "user" in session or \
                not "user_token" in session or \
                not isinstance(session["user"], list):
                return redirect(url_for("auth.auth_login"))
        except Exception as e:
            print(f"Original error:: {e}") #logging

        return func(*args, **kwargs)

    return check_login

@bp.route("/logout", methods=("GET", "POST"))
def auth_logout():
    r = get_redis()
    r.delete(session["user_token"])
    session.clear()
    return redirect(url_for("auth.auth_login"))

@bp.route("/")
@bp.route("/login", methods=("GET", "POST"))
def auth_login():
    if request.method == "POST":
        formData = request.form
        user     = formData['username']
        pasw     = formData['password']

        try:
            c = get_cursor()
            c.execute("SELECT * FROM vm_users WHERE username = %s", (user,))
            u = c.fetchall()

            if not u or len(u) <= 0:
                return jsonify({
                    "success": False,
                    "message": "User not found."
                })

            #password
            if not check_password_hash(u[0]['password'], pasw):
                 return jsonify({
                    "success": False,
                    "message": "Wrong password."
                })

            c.execute(
                """
                    SELECT uu.id usu_id, cmp.comp_id, cmp.hd_size, 
                           oos.os_name, oos.os_memory, cpu.cpu_power, 
                           cpu.cpu_cores, mem.mem_size 
                    FROM vm_users uu, vm_computer cmp, vm_cpu cpu, vm_memory mem, vm_os oos
                    WHERE uu.id = %s
                    AND cmp.usu_id = uu.id
                    AND cmp.cpu_id = cpu.cpu_id
                    AND cmp.mem_id = mem.mem_id
                    AND cmp.os_id  = oos.os_id
                """,
                (u[0]["id"],)
            )
            comp = c.fetchall()

            if len(comp) <= 0:
                raise Exception("User has no computer.")

            token_hash = base64.urlsafe_b64encode(
                hashlib.sha256(f"{u[0]['username']}:{u[0]['id']}:{time.time()}".encode()).digest()
            ).decode()

            session["user"]       = u[0]
            session["user_token"] = token_hash

            get_redis().set(token_hash, json.dumps(dict(comp[0])))

            return jsonify({
                "success": True,
                "message": "Login successful. Wait for be redirect... "
            })

        except Exception as e:
            print(f"Original error:: {e}") #logging
        finally:
            c.close()

    else:
        return render_template("login.html")

@bp.route("/register", methods=("GET", "POST"))
def register():
    if request.method == "POST":
        formData = request.form
        user     = formData['username']
        pasw     = generate_password_hash(formData['password'])
        db       = get_db()

        try:
            c = get_cursor()
            c.execute("SELECT * FROM vm_users WHERE username = %s", (user,))
            u = c.fetchone()

            if u:
                raise Exception('User already exists.')
            
            c.execute("INSERT INTO vm_users (username, password, created_on) VALUES (%s,%s,NOW()) RETURNING id", (user,pasw,))
            _user_id = c.fetchone()[0]
            c.execute("""
                INSERT INTO vm_computer 
                (os_id, cpu_id, mem_id, hd_size, usu_id) 
                    VALUES 
                (
                    (select os_id from vm_os o where o.os_name ='Crankshaft'),
                    (select cpu_id from vm_cpu cpu where cpu.cpu_name = 'Tier_One'),
                    (select mem_id from vm_memory cpu where cpu.mem_name = 'Mem_Tier_One'),
                    %s,
                    %s
                )
            """, (current_app.config["HD_SIZE_DEFAULT"], _user_id,))
            db.commit()

            return jsonify({
                "success": True,
                "message": "User registered. Redirecting to login..."
            })
        except Exception as e:
            print(f"Original Error:: {e}") #logging
            db.rollback()
            return jsonify({
                "success": False,
                "message": f"{e}"
            }), 400
        finally:
            c.close()
    else:
        return render_template("register.html")
