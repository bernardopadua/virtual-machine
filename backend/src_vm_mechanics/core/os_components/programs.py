from enum import Enum
from core.OS import OperatingSystem

class TProgs(Enum):
    frw = "firewall"
    crw = "crackwall"
    brw = "browser"
    avs = "antivirus"
    rwt = "RawTextEditor"

class Programs:
    def __init__(self, progData: dict, _os: OperatingSystem) -> None:
        self.progName = progData["progName"]
        self.version  = progData["version"]
        self.size     = progData["size"]
        self.type     = progData["type"]

        self.__os = _os

class PFirewall(Programs):
    pass #?