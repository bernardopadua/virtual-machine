from pymongo.collection import Collection

from core.OS import OperatingSystem
from .programs_constants import TProgs
from .wsocket_messaging import Pqueue, TypeMessage

import asyncio

class Programs:
    def __init__(self, progData: dict, _os: OperatingSystem) -> None:
        self.progName = progData["progName"]
        self.version  = progData["version"]
        self.size     = progData["size"]
        self.type     = progData["type"]

        self.timeSleep= 0
        
        self._os = _os

        self.runningLoop = None
    
    def setARunningLoop(self, rLoop: any):
        self.runningLoop = rLoop

    def setTimeSleep(self, time:int) -> None:
        self.timeSleep = time

    def setPid(self, pid:int) -> None:
        self.pid = pid

    #override / implements
    def install(self):
        pass 

    def regMongoProgram(self, coll:Collection) -> bool:
        try:
            if coll.count_documents({"progName": self.progName}) <= 0:
                coll.insert_one({"progName": self.progName, "size": self.size})
                asyncio.run(self._os.messageTop("Program Installed.", typeMsg=TypeMessage.GREEN.value))
                return True
            else:
                asyncio.run(self._os.messageTop("Program already installed."))
                return False
        except Exception as e:
            print(f"[regMongoProgram]: Error : {e}")

        return False

    def listProgs(self):
        self._os.enqueueProcess({"operation": Pqueue.LISTPROGS.value})
        self.runningLoop.create_task(self._os.processQueue())

class RawTextEditor(Programs):
    def __init__(self, _os: OperatingSystem, *, timeSleep: int = 0) -> None:
        super().__init__({
            "progName": "RawTextEditor",
            "version": None,
            "size": 350,
            "type": TProgs.rwt.value
        }, _os)

    def install(self) -> None:
        mongo = self._os.getSyncMongoPrograms()
        reg = self.regMongoProgram(mongo)

        if self.timeSleep > 0 and reg:
            import time
            time.sleep(self.timeSleep)

        self._os.killPid_noWait(self.pid)
        self.listProgs()            