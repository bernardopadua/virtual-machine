#Config file.. defines
from enum import Enum

MONGO_DB_STRING_CONN = "mongodb://admin:secret@10.5.0.6:27017/"
class MONGO_DB_COLLECTIONS(Enum):
    usersfs           = "users_filesystem"
    userfscollection  = "user{}_filesystem"
    userfsConn        = MONGO_DB_STRING_CONN+"users_filesystem"
    userprograms      = "users_programs"
    userpgrcollection = "user{}_programs"
    userpgrConn        = MONGO_DB_STRING_CONN+"users_programs"


REDIS_HOST = "10.5.0.5"
REDIS_PORT = 6379