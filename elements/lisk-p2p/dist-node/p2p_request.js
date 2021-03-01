"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
class P2PRequest {
    constructor(options, respondCallback) {
        this._procedure = options.procedure;
        this._data = options.data;
        this._peerId = options.id;
        this._rate = options.rate;
        options.productivity.requestCounter += 1;
        this._respondCallback = (responseError, responsePacket) => {
            if (this._wasResponseSent) {
                throw new errors_1.RPCResponseAlreadySentError(`A response has already been sent for the request procedure <<${options.procedure}>>`);
            }
            this._wasResponseSent = true;
            if (!responseError && responsePacket) {
                options.productivity.lastResponded = Date.now();
                options.productivity.responseCounter += 1;
            }
            options.productivity.responseRate =
                options.productivity.responseCounter / options.productivity.requestCounter;
            respondCallback(responseError, responsePacket);
        };
        this._wasResponseSent = false;
    }
    get procedure() {
        return this._procedure;
    }
    get data() {
        return this._data;
    }
    get rate() {
        return this._rate;
    }
    get peerId() {
        return this._peerId;
    }
    get wasResponseSent() {
        return this._wasResponseSent;
    }
    end(responseData) {
        const responsePacket = {
            data: responseData,
            peerId: this.peerId,
        };
        this._respondCallback(undefined, responsePacket);
    }
    error(responseError) {
        this._respondCallback(responseError);
    }
}
exports.P2PRequest = P2PRequest;
//# sourceMappingURL=p2p_request.js.map