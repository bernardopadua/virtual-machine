from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.collection import Collection
from conf import MONGO_DB_STRING_CONN, MONGO_DB_COLLECTIONS

class Kernel:
    def __init__(self, userId) -> None:
        self._userId = userId
        
        self._mongoFS           = \
            AsyncIOMotorClient(MONGO_DB_STRING_CONN) \
            [MONGO_DB_COLLECTIONS.usersfs.value] \
            [MONGO_DB_COLLECTIONS.userfscollection.value.format(userId)]
        self._installedPrograms = \
            AsyncIOMotorClient(MONGO_DB_STRING_CONN)\
            [MONGO_DB_COLLECTIONS.userprograms.value]\
            [MONGO_DB_COLLECTIONS.userpgrcollection.value.format(userId)]

        self._syncMongoPrograms = None

        self.__os = None

    def getSyncMongoPrograms(self) -> Collection:
        self._syncMongoPrograms = \
            MongoClient(MONGO_DB_STRING_CONN)\
            [MONGO_DB_COLLECTIONS.userprograms.value]\
            [MONGO_DB_COLLECTIONS.userpgrcollection.value.format(self._userId)]

        return self._syncMongoPrograms

    def kGetPrograms_noWait(self):
        mongo = self.getSyncMongoPrograms()
        total = mongo.count_documents({})
        if total == 0:
            return []
        return mongo.find({}, {"_id": 0})

    async def kGetPrograms(self):
        total = await self._installedPrograms.count_documents({})
        if total == 0:
            return []
        c = self._installedPrograms.find({}, {"_id": 0})
        return await c.to_list(length=total)

    #region FilesAndFolder

    async def kGetFile(self, filePath:str) -> dict:
        total = await self._mongoFS.count_documents({"filePath":filePath})
        if total == 0:
            return None
        return await self._mongoFS.find_one({"filePath":filePath}, {"_id": 0})
    
    async def kReplaceFileContents(self, filePath:str, fileContents:str) -> dict:
        total = await self._mongoFS.count_documents({"filePath":filePath})
        if total == 0:
            return {
                "success": False
            }
        result = await self._mongoFS.update_one({"filePath": filePath}, {"$set": {"fileContents": fileContents}})
        if result.modified_count == 0 and result.matched_count >= 1:
            return {
                "success": False,
                "message": "File saved, but remained with the same content."
            }
        elif result.modified_count >= 1:
            return {
                "success": True
            }
        return {
            "success": False
        }

    async def kGetFolder(self, folderPath:str) -> list:
        total = await self._mongoFS.count_documents({"folder": folderPath})
        if total == 0:
            return []
        cursor = self._mongoFS.find({"folder": folderPath}, {"fileContents":0, "_id": 0})
        return await cursor.to_list(length=total)

    async def kFolderExists(self, folderPath:str):
        return await self._mongoFS.count_documents({"folder": folderPath}) > 0

    async def kFileExists(self, filePath:str):
        return await self._mongoFS.count_documents({"filePath": filePath}) > 0

    #endregion FilesAndFolder