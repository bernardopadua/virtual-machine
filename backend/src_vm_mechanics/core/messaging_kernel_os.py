class kMessage:
    def __init__(self, *, success:bool = False, message:str = '') -> None:
        self.success = success
        self.message = message

    def serialize(self) -> dict:
        return self.__dict__