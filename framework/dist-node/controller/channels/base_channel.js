"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseChannel = void 0;
const action_1 = require("../action");
const constants_1 = require("../../constants");
class BaseChannel {
    constructor(moduleAlias, events, actions, options = {}) {
        this.moduleAlias = moduleAlias;
        this.options = options;
        this.eventsList = options.skipInternalEvents ? events : [...events, ...constants_1.INTERNAL_EVENTS];
        this.actions = {};
        for (const actionName of Object.keys(actions)) {
            const actionData = actions[actionName];
            const handler = typeof actionData === 'object' ? actionData.handler : actionData;
            const method = `${this.moduleAlias}:${actionName}`;
            this.actions[actionName] = new action_1.Action(null, method, undefined, handler);
        }
        this.actionsList = Object.keys(this.actions);
    }
    isValidEventName(name, throwError = true) {
        const result = constants_1.eventWithModuleNameReg.test(name);
        if (throwError && !result) {
            throw new Error(`[${this.moduleAlias}] Invalid event name ${name}.`);
        }
        return result;
    }
    isValidActionName(name, throwError = true) {
        const result = constants_1.eventWithModuleNameReg.test(name);
        if (throwError && !result) {
            throw new Error(`[${this.moduleAlias}] Invalid action name ${name}.`);
        }
        return result;
    }
}
exports.BaseChannel = BaseChannel;
//# sourceMappingURL=base_channel.js.map