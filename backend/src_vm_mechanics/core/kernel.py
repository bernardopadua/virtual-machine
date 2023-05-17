from pymongo import MongoClient
from conf import MONGO_DB_STRING_CONN, MONGO_DB_COLLECTIONS

class Kernel:
    def __init__(self, userId) -> None:
        self.__mongoFS           = \
            MongoClient(MONGO_DB_STRING_CONN) \
            [MONGO_DB_COLLECTIONS.usersfs.value] \
            [MONGO_DB_COLLECTIONS.userfscollection.value.format(userId)]
        self.__installedPrograms = \
            MongoClient(MONGO_DB_STRING_CONN)\
            [MONGO_DB_COLLECTIONS.userprograms.value]\
            [MONGO_DB_COLLECTIONS.userpgrcollection.value.format(userId)]

        self.__os = None

    def kGetFile(self, filePath):
        if self.__mongoFS.count_documents({"filePath":filePath}) == 0:
            return None
        return self.__mongoFS.find({"filePath":filePath})[0]
        return list
