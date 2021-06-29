"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const assert_1 = require("assert");
const constants_1 = require("../constants");
const jsonrpc_1 = require("./jsonrpc");
class Action {
    constructor(id, name, params, handler) {
        assert_1.strict(constants_1.actionWithModuleNameReg.test(name), `Action name "${name}" must be a valid name with module name and action name.`);
        this.id = id;
        [this.module, this.name] = name.split(':');
        this.params = params !== null && params !== void 0 ? params : {};
        this.handler = handler;
    }
    static fromJSONRPCRequest(data) {
        const { id, method, params } = typeof data === 'string' ? JSON.parse(data) : data;
        return new Action(id, method, params);
    }
    toJSONRPCRequest() {
        return {
            jsonrpc: jsonrpc_1.VERSION,
            id: this.id,
            method: `${this.module}:${this.name}`,
            params: this.params,
        };
    }
    buildJSONRPCResponse({ error, result, }) {
        if (error) {
            return { id: this.id, jsonrpc: jsonrpc_1.VERSION, error };
        }
        return { id: this.id, jsonrpc: jsonrpc_1.VERSION, result: result };
    }
    key() {
        return `${this.module}:${this.name}`;
    }
}
exports.Action = Action;
//# sourceMappingURL=action.js.map