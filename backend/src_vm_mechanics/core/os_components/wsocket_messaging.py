from enum import Enum

class Pqueue(Enum):
    OPENFILE   = 'openfile'
    SAVEEXFILE = 'saveandexitfile'
    OPENFOLDER = 'openfolder'
    LISTFILES  = 'listfiles'
    LISTPROC   = 'listprocess'
    LISTPROGS  = 'listprograms'
    MSGTOP     = 'messagetop'
    INSTPROG   = 'installprogram'

class TypeMessage(Enum):
    GREEN  = 'green'
    YELLOW = 'yellow'