import json 

class Process:
    def __init__(self, *, pid:int = 0, name:str = "Dummy", memory:int = 0) -> None:
        self.name = ""
        self.memory = 0
    
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True)