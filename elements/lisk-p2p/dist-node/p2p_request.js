"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P2PRequest = void 0;
const errors_1 = require("./errors");
class P2PRequest {
    constructor(procedure, data, respondCallback) {
        this._procedure = procedure;
        this._data = data;
        this._respondCallback = (responseError, responsePacket) => {
            if (this._wasResponseSent) {
                throw new errors_1.RPCResponseAlreadySentError('A response has already been sent for this request');
            }
            this._wasResponseSent = true;
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
    get wasResponseSent() {
        return this._wasResponseSent;
    }
    end(responseData) {
        const responsePacket = {
            data: responseData,
        };
        this._respondCallback(undefined, responsePacket);
    }
    error(responseError) {
        this._respondCallback(responseError);
    }
}
exports.P2PRequest = P2PRequest;
//# sourceMappingURL=p2p_request.js.map