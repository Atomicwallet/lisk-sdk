"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSChannel = void 0;
const WebSocket = require("isomorphic-ws");
const events_1 = require("events");
const utils_1 = require("./utils");
const CONNECTION_TIMEOUT = 2000;
const RESPONSE_TIMEOUT = 3000;
const timeout = async (ms, message) => new Promise((_, reject) => {
    const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(message !== null && message !== void 0 ? message : `Timed out in ${ms}ms.`));
    }, ms);
});
const defer = () => {
    let resolve;
    let reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return { promise, resolve, reject };
};
const messageIsNotification = (input) => !!((input.id === undefined || input.id === null) && input.method);
class WSChannel {
    constructor(url) {
        this.isAlive = false;
        this._requestCounter = 0;
        this._pendingRequests = {};
        this._url = url;
        this._emitter = new events_1.EventEmitter();
    }
    async connect() {
        this._ws = new WebSocket(this._url);
        this._ws.onclose = this._handleClose.bind(this);
        this._ws.onmessage = this._handleMessage.bind(this);
        this._ws.addEventListener('ping', this._handlePing.bind(this));
        const connectHandler = new Promise(resolve => {
            var _a;
            const onOpen = () => {
                var _a;
                this.isAlive = true;
                (_a = this._ws) === null || _a === void 0 ? void 0 : _a.removeEventListener('open', onOpen);
                resolve();
            };
            (_a = this._ws) === null || _a === void 0 ? void 0 : _a.addEventListener('open', onOpen);
        });
        const errorHandler = new Promise((_, reject) => {
            var _a;
            const onError = (error) => {
                var _a;
                this.isAlive = false;
                (_a = this._ws) === null || _a === void 0 ? void 0 : _a.removeEventListener('error', onError);
                reject(error.error);
            };
            (_a = this._ws) === null || _a === void 0 ? void 0 : _a.addEventListener('error', onError);
        });
        try {
            await Promise.race([
                connectHandler,
                errorHandler,
                timeout(CONNECTION_TIMEOUT, `Could not connect in ${CONNECTION_TIMEOUT}ms`),
            ]);
        }
        catch (err) {
            this._ws.close();
            throw err;
        }
    }
    async disconnect() {
        this._requestCounter = 0;
        this._pendingRequests = {};
        if (!this._ws) {
            return;
        }
        if (this._ws.readyState === WebSocket.CLOSED) {
            this.isAlive = false;
            this._ws = undefined;
            return;
        }
        const closeHandler = new Promise(resolve => {
            var _a;
            const onClose = () => {
                var _a;
                this.isAlive = false;
                (_a = this._ws) === null || _a === void 0 ? void 0 : _a.removeEventListener('close', onClose);
                resolve();
            };
            (_a = this._ws) === null || _a === void 0 ? void 0 : _a.addEventListener('close', onClose);
        });
        this._ws.close();
        await Promise.race([
            closeHandler,
            timeout(CONNECTION_TIMEOUT, `Could not disconnect in ${CONNECTION_TIMEOUT}ms`),
        ]);
    }
    async invoke(actionName, params) {
        var _a;
        if (!this.isAlive) {
            throw new Error('Websocket client is not connected.');
        }
        const request = {
            jsonrpc: '2.0',
            id: this._requestCounter,
            method: actionName,
            params: params !== null && params !== void 0 ? params : {},
        };
        (_a = this._ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(request));
        const response = defer();
        this._pendingRequests[this._requestCounter] = response;
        this._requestCounter += 1;
        return Promise.race([
            response.promise,
            timeout(RESPONSE_TIMEOUT, `Response not received in ${RESPONSE_TIMEOUT}ms`),
        ]);
    }
    subscribe(eventName, cb) {
        this._emitter.on(eventName, cb);
    }
    _handleClose() {
        this.isAlive = false;
    }
    _handlePing() {
        this.isAlive = true;
    }
    _handleMessage(event) {
        const res = JSON.parse(event.data);
        if (messageIsNotification(res)) {
            this._emitter.emit(res.method, res.params);
        }
        else {
            const id = typeof res.id === 'number' ? res.id : parseInt(res.id, 10);
            if (this._pendingRequests[id]) {
                if (res.error) {
                    this._pendingRequests[id].reject(utils_1.convertRPCError(res.error));
                }
                else {
                    this._pendingRequests[id].resolve(res.result);
                }
                delete this._pendingRequests[id];
            }
        }
    }
}
exports.WSChannel = WSChannel;
//# sourceMappingURL=ws_channel.js.map