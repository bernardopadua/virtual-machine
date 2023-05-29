from datetime import timedelta

SECRET_KEY="verycomplicated"
PERMANENT_SESSION_LIFETIME=timedelta(days=5)
DATABASE="postgresql://vmachine:vmachine@10.5.0.3"

REDIS_HOST = "10.5.0.5"
REDIS_PORT = 6379

# DEFAULTS
HD_SIZE_DEFAULT = 50000

#MONGODB
MONGO_STR_CONNECT        = "mongodb://admin:secret@10.5.0.6:27017/"
MONGO_USER_FS            = "users_filesystem"
MONGO_USERFS_COLLECTION  = "user{}_filesystem"