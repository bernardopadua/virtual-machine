from enum import Enum

class MgDocType(Enum):
    FILE   = 'fl'
    FOLDER = 'fd'

class MgFileFolder:
    def __init__(self, *, 
            userId:int = 0,
            fileOrFolder:str = None,
            fileType:str = None,
            fileName:str = None,
            filePath:str = None,
            folderPath:str = None,
            folder:str = None,
            fileContents:str = None,
            folderName:str = None,
            program:str = None,
    ) -> None:
        self.userId       = userId
        self.fileOrFolder = fileOrFolder
        self.fileType     = fileType
        self.fileName     = fileName
        self.filePath     = filePath
        self.folder       = folder
        self.folderName   = folderName
        self.folderPath   = folderPath
        self.fileContents = fileContents
        self.program      = program

    def toJson(self) -> dict:
        return self.__dict__