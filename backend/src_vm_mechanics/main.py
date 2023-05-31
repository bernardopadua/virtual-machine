from websockets.datastructures import Headers
from websockets.legacy.server import WebSocketServerProtocol
from websockets.exceptions import ConnectionClosed

from core.OS import OperatingSystem, Pqueue
from conf import REDIS_HOST, REDIS_PORT
from redis_constants import USER_SESSION_WEBSOCKET

import asyncio, http, websockets, json
from redis import Redis
from urllib.parse import urlparse, parse_qs

# example using create_protocol on serve function
class Middleware(WebSocketServerProtocol):
    async def process_request(self, path: str, request_headers: Headers):
        url = urlparse(path)
        if url.path != '/init':
            return http.HTTPStatus.BAD_REQUEST, [], b"Malformed request"

        qs = parse_qs(url.query)

        #redis connection
        redis   = Redis(host=REDIS_HOST, port=REDIS_PORT)
        session = json.loads(redis.get(qs["token"][0]).decode())

        self.computer = session
        self.user_os  = OperatingSystem(
            session["usu_id"],
            memQtd=session["mem_size"],
            hdSize=session["hd_size"],
            cpuCores=session["cpu_cores"],
            cpuPower=session["cpu_power"],
            osMemory=session["os_memory"],
            osName=session["os_name"],
            ws=self
        )

async def handler(ws: WebSocketServerProtocol):
    try:
        async for msg in ws:
            data = json.loads(msg)

            _os:OperatingSystem  = ws.user_os
            _os.enqueueProcess(data)
            
            task = asyncio.create_task(_os.processQueue())

            await _os.joinQueue()

            task.cancel()
    except ConnectionClosed as cncl:
        print("Connection closed...")
    except Exception as e:
        print(f"\n\tCommon error: {e}\n")

async def handlerr(ws):
    async for msg in ws:
        await ws.send(msg)

async def main():
    #async with websockets.serve(handlerr, "localhost", 8081):
    async with websockets.serve(handler, "0.0.0.0", 8081, create_protocol=Middleware):
        await asyncio.Future()

if __name__=="__main__":
    asyncio.run(main()) #do this when computer turns on
    #asyncio.run(nmain())
