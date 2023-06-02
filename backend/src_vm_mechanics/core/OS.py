from websockets.legacy.server import WebSocketServerProtocol

from .kernel import Kernel
from .os_components.process import Process
from .os_components.wsocket_messaging import Pqueue, TypeMessage
from .os_components.programs_constants import TProgs
from .os_constants import FileTypes

from typing import List, Optional
import asyncio, json, re

class OperatingSystem(Kernel):
    def __init__(
            self, userId, *, memQtd:int = 0, 
            hdSize:int = 0, cpuCores:int = 0,
            cpuPower:int = 0, osName:str = None, osMemory:int = 0,
            ws:WebSocketServerProtocol = None,
            
        ):
        #TODO: Interface must be a mirror of this current directory
        super().__init__(userId=userId, currentDirectory='/') 
        
        #increasing forever, as long
        # as computer is turned on
        self._pidList    = 1 
        self.memQtd      = memQtd
        self.cpuCores    = cpuCores
        self.cpuPower    = cpuPower
        self.hdSize      = hdSize

        self.processPid  = 0
        self.processPool = []
        #default process
        self.addProcessRunning_noWait(osName, osMemory)

        self.ws = ws
        self.nsend = None

        self.__os = self #kernel
        
        self.__loopQueue  = asyncio.Queue()
        self.isProcessing = False

        # Initializing programs installed
        self.programsInstalled = {}
        self.programsOpenedPid = {}
        self.fillProgramsInstalled()

    #region INITIALIZING

    def fillProgramsInstalled(self):
        programs = self.kGetPrograms_noWait()
        for prg in programs:
            self.programsInstalled[prg["progName"]] = prg

    #endregion INITIALIZING

    #region PROCESS

    def killPid_noWait(self, pid:int, *, timeSleep: int = 0) -> None:
        for prc in self.processPool:
            if prc.pid==pid:
                self.processPool.remove(prc)

    def addProcessRunning_noWait(self, name:str, memory:int) -> Optional[Process]:
        total_mem_used = sum([p.memory for p in self.processPool])
        
        if ((self.memQtd - total_mem_used) - memory) >= 0:
            self.processPid += 1
            p = Process(pid=self.processPid, name=name, memory=memory)
            self.processPool.append(
                p
            )
            return p
        else: 
            return None
    
    async def addProcessRunning(self, name:str, memory:int) -> None:
        total_mem_used = sum([p.memory for p in self.processPool])
        
        if ((self.memQtd - total_mem_used) - memory) >= 0:
            self.processPid += 1
            p = Process(pid=self.processPid, name=name, memory=memory)
            self.processPool.append(
                Process(pid=self.processPid, name=name, memory=memory)
            )
            return p
        else: 
            return None

    #endregion PROCESS

    #region FILES OPERATIONS

    async def setCurrentDirectory(self, directory:str):
        self._currentDirectory = directory

    async def getFile(self, filePath:str) -> str:
        #this string must be treated (security)
        result = await self.kGetFile(filePath=filePath)
        if result:
            return result
        return None

    async def replaceFileContents(self, filePath:str, fileContents:str) -> dict:
        result = await self.kReplaceFileContents(filePath=filePath, fileContents=fileContents)
        return result

    async def getFolder(self, folderPath:str) -> List[dict]:
        result = await self.kGetFolder(folderPath=folderPath)
        return result

    async def folderExists(self, folderPath:str) -> bool:
        result = await self.kFolderExists(folderPath)
        return result

    async def fileExists(self, filePath:str, *, fileType:str=None) -> bool:
        result = await self.kFileExists(filePath, fileType=fileType)
        return result

    def checkFolderRegex(self, folderPath:str) -> bool:
        reTest = re.match(r'^\/|(/)?([^/\0]+(/)?)+$', folderPath)
        if reTest:

            if len(folderPath) > 1:
                s = folderPath.split('/')
                del s[0] #first slash (/)
                #removing blank from last slash (/)
                if s[len(s)-1] == '':
                    del s[len(s)-1]

                if '' in s:
                    return False

            return True

        return False

    async def checkFileTypeAndOpenProcessProgram(self, file:dict) -> None:
        if file["fileType"] in [FileTypes.RAW.value, FileTypes.TXT.value]:
            if TProgs.rwt.value in self.programsInstalled:
                prc = await self.addProcessRunning(
                    self.programsInstalled[TProgs.rwt.value]["progName"],
                    self.programsInstalled[TProgs.rwt.value]["size"]
                )
                if prc is None:
                    self.messageTop("Free up some memory to run this program.")
                    return None
                else:
                    self.programsOpenedPid[prc.pid] = {
                        "file": file,
                        "program": {
                            "pid": prc.pid,
                            "program": self.programsInstalled[TProgs.rwt.value]["progName"],
                        }
                    }
                return prc
            else:
                await self.messageTop("You doesn't has the appropriated program to open this file.")


    #endregion FILES

    #region USEFUL OS

    async def sendWs(self, dictData:dict) -> None:
        await self.ws.send(json.dumps(dictData))

    async def messageTop(self, message: str, *, typeMsg: str = None, timeVanish:int = None) -> None:
        if typeMsg is None:
            await self.ws.send(json.dumps({"operation": Pqueue.MSGTOP.value, "message": message, "timeVanish": timeVanish}))
        else:
            await self.ws.send(json.dumps({"operation": Pqueue.MSGTOP.value, "typemsg": typeMsg, "message": message, "timeVanish": timeVanish}))

    async def getProgramsInstalled(self) -> List[dict]:
        result = await self.kGetPrograms()
        return result

    #endregion USEFUL OS

    #region OS_QUEUES AND PROCESSING

    async def joinQueue(self) -> None:
        await self.__loopQueue.join()

    def enqueueProcess(self, process:dict) -> None:
        self.__loopQueue.put_nowait(process)

    async def asyncEnqueueProcess(self, process:dict) -> None:
        await self.__loopQueue.put(process)

    async def processQueue(self)->None:
        if self.isProcessing:
            return

        try:
            while True:
                self.isProcessing = True
                task = await self.__loopQueue.get()

                if not task:
                    self.__loopQueue.task_done()

                #parse dict
                match task['operation']:
                    #>
                    case 'test':
                        await self.test()
                    
                    #>
                    case Pqueue.OPENFILE.value:
                        file = await self.getFile(task['filePath'])
                        prc  = await self.checkFileTypeAndOpenProcessProgram(file)
                        if prc is not None:
                            await self.ws.send(json.dumps({
                                "operation": Pqueue.OPENFILE.value,
                                "contents": self.programsOpenedPid[prc.pid]
                            }))

                            await self.asyncEnqueueProcess({"operation": Pqueue.LISTPROC.value})
                        else:
                            await self.ws.send(json.dumps({
                                "operation": Pqueue.OPENFILE.value,
                                "contents": None
                            }))

                    #>
                    case Pqueue.CREATEFILE.value:
                        result = await self.kCreateFile(
                            task['fileName'],
                            task['fileType']
                        )

                        if result["success"]:
                            await self.messageTop(result["message"], typeMsg=TypeMessage.GREEN.value)
                        else:
                            await self.messageTop(result["message"])

                        #TODO: How to enqueue another task ??
                        await self.asyncEnqueueProcess({"operation": Pqueue.LISTFILES.value})

                    #>
                    case Pqueue.REMOVEFILE.value:
                        fP = task['filePath']
                        fT = task['fileType']
                        if not await self.fileExists(fP, fileType=fT):
                            await self.messageTop("File doesn't exist")
                        
                        r = await self.kRemoveFile(fP, fileType=fT)
                        if r["success"]:
                            await self.messageTop(r["message"], typeMsg=TypeMessage.GREEN.value)
                            await self.asyncEnqueueProcess({"operation": Pqueue.LISTFILES.value})
                        else:
                            await self.messageTop(r["message"])

                    #>
                    case Pqueue.CREATEFLD.value:
                        fd = task['folderName']
                        fP = self.concantCurrentDir(fd)
                        if await self.kFolderExists(folderPath=fP, isFolder=True):
                            await self.messageTop(message="Folder already exists!")
                        else:
                            r = await self.kCreateFolder(folder=self._currentDirectory, folderName=fd, folderPath=fP)
                            if r['success']:
                                await self.messageTop(message=r['message'], typeMsg=TypeMessage.GREEN.value)
                                await self.asyncEnqueueProcess({"operation": Pqueue.LISTFILES.value})
                            else:
                                await self.messageTop(message=r['message'])
                    
                    #>
                    case Pqueue.REMOVEFLD.value:
                        fP = task['folderPath']
                        if await self.kFolderExists(folderPath=fP, isFolder=True):
                            r = await self.kRemoveFolderRecursive(fP)
                            if r["success"]:
                                await self.messageTop(message=r["message"], typeMsg=TypeMessage.GREEN.value)
                                await self.asyncEnqueueProcess({"operation": Pqueue.LISTFILES.value})
                            else:
                                await self.messageTop(message=r["message"])
                        else:
                            self.messageTop(message="Folder doesn't exists!")
                    #>
                    # {
                    #     operation: Operations.SAVEEXFILE,
                    #     file: {
                    #         filePath: this.state.filePath,
                    #         fileContents: this.state.fileContents
                    #     },
                    #     program: {
                    #         pid: this.state.pid,
                    #         program: this.state.progam
                    #     }
                    # }
                    case Pqueue.SAVEEXFILE.value:
                        pD = task['program']['pid']
                        pG = task['program']['program']
                        fP = task['file']['filePath']
                        fC = task['file']['fileContents']
                        r  = await self.replaceFileContents(fP,fC)

                        if "success" not in r:
                            await self.messageTop("Internal kernel error.")
                            raise Exception("[Pqueue.SAVEEXFILE] Internal kernel error")

                        if r["success"]:
                            await self.messageTop("File was replaced successfully!", typeMsg=TypeMessage.GREEN.value)
                        elif not r["success"] and "message" in r:
                            await self.messageTop(r["message"], typeMsg=TypeMessage.YELLOW.value)
                        else:
                            await self.messageTop("There was a problem modifying your file.")

                        self.killPid_noWait(pid=pD)
                        
                        #refreshing procs
                        self.enqueueProcess({"operation": Pqueue.LISTPROC.value})

                        await self.ws.send(json.dumps({
                            "operation": Pqueue.SAVEEXFILE.value, 
                            "contents": {
                                "program": pG,
                                "pid": pD
                            }
                        }))

                    #>
                    case Pqueue.LISTPROC.value:
                        processes = [f.toJSON() for f in self.processPool]
                        await self.ws.send(json.dumps({"operation": Pqueue.LISTPROC.value, "contents": processes}))

                    #>
                    case Pqueue.INSTPROG.value:
                        if not await self.fileExists(task['filePath']):
                            await self.ws.send(json.dumps({
                                "operation": Pqueue.MSGTOP.value, 
                                "message": "Invalid file."
                            }))
                        try:
                            import importlib
                            r = importlib.import_module("core.os_components.programs")
                            Program = getattr(r, task['program'])
                            
                            p = Program(self)
                            prc = self.addProcessRunning_noWait(
                                name=p.progName, memory=p.size
                            )
                            #Check memory availability
                            if prc is not None:
                                p.setTimeSleep(5)
                                p.setPid(prc.pid)
                                l = asyncio.get_running_loop()
                                p.setARunningLoop(l)
                                l.run_in_executor(None, p.install)
                            else:
                                await self.messageTop("Not enough memory available")
                            if not prc:
                                raise Exception("Process not running") #message on top, memory not enough
                        except Exception as e:
                            print(f"Error INSTPROG:: {e}")
                            self.__loopQueue.task_done()

                    #>
                    case Pqueue.CHNGCURDIR.value:
                        if self.checkFolderRegex(task['folder']):
                            if task['folder'] == '/': #root
                                exists = await self.folderExists(task['folder'])
                            else:
                                exists = await self.kFolderExists(folderPath=task['folder'], isFolder=True)
                            if not exists:
                                await self.messageTop(message="Folder doesn't exists.")
                                await self.sendWs({"operation": Pqueue.CHNGCURDIR.value, "folder": self._currentDirectory})
                            else:
                                self._currentDirectory = task['folder']
                                await self.sendWs({"operation": Pqueue.CHNGCURDIR.value, "folder": self._currentDirectory})
                                await self.asyncEnqueueProcess({"operation": Pqueue.LISTFILES.value})
                        else:
                            await self.messageTop(message="Invalid folder! Valid one: /folder1/folder2/")
                            await self.sendWs({"operation": Pqueue.CHNGCURDIR.value, "folder": self._currentDirectory})

                    #>
                    case Pqueue.LISTFILES.value:
                        if self.checkFolderRegex(self._currentDirectory):
                            if self._currentDirectory != '/': #root
                                exists = await self.kFolderExists(folderPath=self._currentDirectory, isFolder=True)
                            else:
                                exists = await self.folderExists(self._currentDirectory)
                            if not exists:
                                await self.messageTop(message="Folder doesn't exists.")
                            else:
                                files = await self.getFolder(self._currentDirectory)
                                await self.ws.send(json.dumps({"operation": Pqueue.LISTFILES.value, "contents": files}))
                        else:
                            await self.ws.send(json.dumps({"operation": Pqueue.LISTFILES.value, "contents": ""}))
                            await self.messageTop(message="Invalid folder! Valid one: /folder1/folder2/")

                    #>
                    case Pqueue.LISTPROGS.value:
                        progs = await self.getProgramsInstalled()
                        await self.ws.send(json.dumps({"operation": Pqueue.LISTPROGS.value, "contents": progs}))

                self.__loopQueue.task_done()
        except Exception as e:
            print(f"Original error:: {e}")
            self.__loopQueue.task_done()
        finally:
            self.isProcessing = False

    #endregion OS_QUEUES AND PROCESSING