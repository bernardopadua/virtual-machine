export default class WebSockets {
    static ws = null;

    /**
        @param {WebSocket} ws
    */
    constructor(ws){
        WebSockets.ws = ws;
        ws.addEventListener("message")
    }

    static send(data) {
        this.ws.send(data);
    }

    static recv
}