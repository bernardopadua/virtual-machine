import asyncio
import websockets
import http
from urllib.parse import urlparse, parse_qs
from websockets.datastructures import Headers
from websockets.legacy.server import WebSocketServerProtocol
from websockets.exceptions import ConnectionClosed

from core.OS import OperatingSystem, Pqueue

# example using create_protocol on serve function
class Middleware(WebSocketServerProtocol):
    async def process_request(self, path: str, request_headers: Headers):
        url = urlparse(path)
        if url.path != '/init':
            return http.HTTPStatus.BAD_REQUEST, [], b"Malformed request"
        qs = parse_qs(url.query)
        self.user_os = None
        pass

async def handler(ws: WebSocketServerProtocol):
    try:
        async for msg in ws:
            #msg = ws.recv()
            print(f"sds:: {msg}")
            print(msg)
    except ConnectionClosed as cncl:
        print("Connection closed...")
    except Exception as e:
        print(f"\n\tCommon error: {e}\n")

async def main():
    #async with websockets.serve(handler, "localhost", 8081):
    async with websockets.serve(handler, "", 8081, create_protocol=Middleware):
        await asyncio.Future()

async def nmain():
    n = OperatingSystem(1)
    n.enqueueProcess({"operation": Pqueue.OFI.value, "filePath": "/ab.txt"})
    
    await n.processQueue()
    await n.joinQueue()

if __name__=="__main__":
    asyncio.run(main()) #do this when computer turns on
    #asyncio.run(nmain())
