from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.collection import Collection

from core.os_constants import CONTAINS_VAR_EXT
#from core.OS import OperatingSystem
from core.mongo_filesystem import MgFileFolder
from core.messaging_kernel_os import kMessage
from conf import MONGO_DB_STRING_CONN, MONGO_DB_COLLECTIONS

class Kernel:
    def __init__(self, userId, *, currentDirectory:str=None) -> None:
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

        self._currentDirectory = currentDirectory
        

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
    def concantCurrentDir(self, fileName:str) -> str:
        cd = self._currentDirectory
        if cd[-1] == '/':
            return f"{cd}{fileName}"
        else:
            return f"{cd}/{fileName}"

    async def kCreateFile(self, fileName:str, fileExt:str) -> dict:
        filePath   = self.concantCurrentDir(fileName=fileName)
        fileExists = await self.kFileExists(filePath=filePath, fileType=fileExt)
        if fileExt not in CONTAINS_VAR_EXT:
           return kMessage(
               message="Unknown file extension"
           ).serialize()

        if not fileExists:
            newFile = MgFileFolder(
                userId=self._userId,
                fileOrFolder='fl',
                fileType=fileExt,
                fileName=fileName,
                filePath=filePath,
                folder=self._currentDirectory,
            )

            await self._mongoFS.insert_one(newFile.toJson())
        
            return kMessage(
                success=True,
                message="File created successfully."
            ).serialize()

        return kMessage(
            message="File already exists!"
        ).serialize()

    async def _countFiles(self, filePath:str, *, fileType:str=None):
        if not fileType:
            return await self._mongoFS.count_documents({"filePath":filePath})
        elif fileType:
            return await self._mongoFS.count_documents({"filePath":filePath, "fileType":fileType})

    async def kGetFile(self, filePath:str) -> dict:
        total = await self._countFiles(filePath)
        if total == 0:
            return None
        return await self._mongoFS.find_one({"filePath":filePath}, {"_id": 0})
    
    async def kRemoveFile(self, filePath:str, *, fileType:str=None) -> dict:
        total = await self._countFiles(filePath, fileType=fileType)
        if total <= 0:
            return kMessage(message="No file to be removed.").serialize()
        if fileType:
            r = await self._mongoFS.delete_one({"filePath": filePath, "fileType": fileType})
        else:
            r = await self._mongoFS.delete_one({"filePath": filePath})
        
        if r:
            return kMessage(message="File removed successfully.", success=True).serialize()
        else:
            return kMessage(message="There was a problem removing the file.").serialize()

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

    async def kFileExists(self, filePath:str, *, fileType:str=None) -> bool:
        if fileType is None:
            return await self._mongoFS.count_documents({"filePath": filePath}) > 0
        else:
            return await self._mongoFS.count_documents({"filePath": filePath, "fileType": fileType}) > 0

    #endregion FilesAndFolder