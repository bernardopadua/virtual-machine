from enum import Enum

class Pqueue(Enum):
    OPENFILE   = 'openfile'
    SAVEEXFILE = 'saveandexitfile'
    OPENFOLDER = 'openfolder'
    LISTFILES  = 'listfiles'
    CHNGCURDIR = 'changecurrentdir'
    LISTPROC   = 'listprocess'
    LISTPROGS  = 'listprograms'
    MSGTOP     = 'messagetop'
    INSTPROG   = 'installprogram'
    CREATEFILE = 'createfile'
    REMOVEFILE = 'removefile'
    CREATEFLD  = 'createfolder'
    REMOVEFLD  = 'removefolder'

class TypeMessage(Enum):
    GREEN  = 'green'
    YELLOW = 'yellow'