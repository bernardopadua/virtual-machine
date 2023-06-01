class MgFileFolder:
    def __init__(self, *, 
            userId:int = 0,
            fileOrFolder:str = None,
            fileType:str = None,
            fileName:str = None,
            filePath:str = None,
            folder:str = None,
            fileContents:str = None,
            folderName:str = None,
            program:str = None,
    ) -> None:
        self.userId = userId
        self.fileOrFolder = fileOrFolder
        self.fileType = fileType
        self.fileName = fileName
        self.filePath = filePath
        self.folder = folder
        self.fileContents = fileContents
        self.folderName = folderName
        self.program = program

    def toJson(self) -> dict:
        return self.__dict__