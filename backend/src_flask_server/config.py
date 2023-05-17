from datetime import timedelta

SECRET_KEY="verycomplicated"
PERMANENT_SESSION_LIFETIME=timedelta(days=5)
DATABASE="postgresql://vmachine:vmachine@10.5.0.3"

REDIS_HOST = "localhost"
REDIS_PORT = 6379

# DEFAULTS
HD_SIZE_DEFAULT = 50000