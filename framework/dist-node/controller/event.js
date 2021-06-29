"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const assert_1 = require("assert");
const constants_1 = require("../constants");
const jsonrpc_1 = require("./jsonrpc");
class Event {
    constructor(name, data) {
        assert_1.strict(constants_1.eventWithModuleNameReg.test(name), `Event name "${name}" must be a valid name with module name and event name.`);
        const [moduleName, ...eventName] = name.split(':');
        this.module = moduleName;
        this.name = eventName.join(':');
        this.data = data;
    }
    static fromJSONRPCNotification(data) {
        const { method, params } = typeof data === 'string' ? JSON.parse(data) : data;
        return new Event(method, params);
    }
    toJSONRPCNotification() {
        return {
            jsonrpc: jsonrpc_1.VERSION,
            method: `${this.module}:${this.name}`,
            params: this.data,
        };
    }
    key() {
        return `${this.module}:${this.name}`;
    }
}
exports.Event = Event;
//# sourceMappingURL=event.js.map