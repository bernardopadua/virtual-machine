#Config file.. defines
from enum import Enum

MONGO_DB_STRING_CONN = "mongodb://127.0.0.1:27017/"
class MONGO_DB_COLLECTIONS(Enum):
    usersfs           = "users_filesystem"
    userfscollection  = "user{}_filesystem"
    userfsConn        = MONGO_DB_STRING_CONN+"users_filesystem"
    userprograms      = "users_programs"
    userpgrcollection = "user{}_programs"
    userpgrConn        = MONGO_DB_STRING_CONN+"users_programs"