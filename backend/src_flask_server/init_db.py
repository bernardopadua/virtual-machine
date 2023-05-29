from flask_server import create_db
import os


script = None 
db     = create_db("postgresql://vmachine:vmachine@10.5.0.3")

if db is None:
    print("Couldn't connect")

if __name__ == "__main__":
    try:
        script = open(f"{os.path.dirname(os.path.abspath(__file__))}/init_db/init.sql").read()
        print(f"Script:: {script}")
        c = db.cursor()
        c.execute(script)
        
        script = open(f"{os.path.dirname(os.path.abspath(__file__))}/init_db/seeds.sql").read()
        print(f"Script:: {script}")
        c.execute(script)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Original error:: {e}")
