from pymongo import MongoClient
from websockets.legacy.server import WebSocketServerProtocol

from conf import MONGO_DB_COLLECTIONS, MONGO_DB_STRING_CONN
from .kernel import Kernel
from .os_components.process import Process

from typing import List
from enum import Enum
import asyncio, json

class Pqueue(Enum):
    OPENFILE   = 'openfile'
    OPENFOLDER = 'openfolder'
    LISTFILES  = 'listfiles'
    LISTPROC   = 'listprocess'

class TaskOS:
    def __init__(self, _type, dictType) -> None:
        self.operation = dictType["operation"]
        self.contents  = (_type == Pqueue.OFI.value) 

class OperatingSystem(Kernel):
    def __init__(
            self, userId, *, memQtd:int = 0, 
            hdSize:int = 0, cpuCores:int = 0,
            cpuPower:int = 0, osName:str = None, osMemory:int = 0,
            ws:WebSocketServerProtocol = None,
            
        ):
        super().__init__(userId=userId)
        
        #increasing forever, as long
        # as computer is turned on
        self._pidList    = 1 
        self.memQtd      = memQtd
        self.cpuCores    = cpuCores
        self.cpuPower    = cpuPower
        self.hdSize      = hdSize

        self.processPid  = 1
        self.processPool = []
        #default process
        self.addProcessRunning(osName, osMemory)

        self.ws = ws

        self.__os = self #kernel
        
        self.__loopQueue  = asyncio.Queue()
        self.isProcessing = False

    def addProcessRunning(self, name:str, memory:int):
        self.processPool.append(
            Process(pid=self.processPid, name=name, memory=memory)
        )
        self.processPid += 1

    async def joinQueue(self):
        await self.__loopQueue.join()

    def enqueueProcess(self, process):
        self.__loopQueue.put_nowait(process)

    async def getFile(self, filePath) -> str:
        #this string must be treated (security)
        result = self.kGetFile(filePath=filePath)
        if result:
            return result['fileContents']
        return None

    def getProgramsInstalled(self) -> List[str]:
        pass

    async def processQueue(self)->None:
        if self.isProcessing:
            return

        try:
            while True:
                self.isProcessing = True
                task = self.__loopQueue.get_nowait()

                if not task:
                    self.__loopQueue.task_done()

                print(f"Get queue {task} and sleeping")
                asyncio.sleep(5)
                print("slept 5 seconds...")
                #parse dict
                match task['operation']:
                    case Pqueue.OPENFILE.value:
                        result = await self.getFile(task['filePath'])
                        self.ws.send(json.dumps({"operation": Pqueue.OFI.value, "contents": result}))
                    case Pqueue.LISTPROC.value:
                        processes = [f.toJSON() for f in self.processPool]
                        self.ws.send(json.dumps({"operation": Pqueue.LISTPROC.value, "contents": processes}))

                self.__loopQueue.task_done()
        except asyncio.QueueEmpty as e:
            self.isProcessing = False
