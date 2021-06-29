"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryChannel = void 0;
const event_1 = require("../event");
const action_1 = require("../action");
const base_channel_1 = require("./base_channel");
class InMemoryChannel extends base_channel_1.BaseChannel {
    async registerToBus(bus) {
        this.bus = bus;
        await this.bus.registerChannel(this.moduleAlias, this.eventsList, this.actions, {
            type: 'inMemory',
            channel: this,
        });
    }
    subscribe(eventName, cb) {
        this.bus.subscribe(eventName, (notificationObject) => setImmediate(cb, event_1.Event.fromJSONRPCNotification(notificationObject).data));
    }
    once(eventName, cb) {
        this.bus.once(eventName, (notificationObject) => setImmediate(cb, event_1.Event.fromJSONRPCNotification(notificationObject).data));
    }
    publish(eventName, data) {
        const event = new event_1.Event(eventName, data);
        if (event.module !== this.moduleAlias) {
            throw new Error(`Event "${eventName}" not registered in "${this.moduleAlias}" module.`);
        }
        this.bus.publish(event.toJSONRPCNotification());
    }
    async invoke(actionName, params) {
        var _a;
        const action = new action_1.Action(null, actionName, params);
        if (action.module === this.moduleAlias) {
            if (this.actions[action.name] === undefined) {
                throw new Error(`The action '${action.name}' on module '${this.moduleAlias}' does not exist.`);
            }
            const handler = (_a = this.actions[action.name]) === null || _a === void 0 ? void 0 : _a.handler;
            if (!handler) {
                throw new Error('Handler does not exist.');
            }
            return handler(action.params);
        }
        return (await this.bus.invoke(action.toJSONRPCRequest())).result;
    }
}
exports.InMemoryChannel = InMemoryChannel;
//# sourceMappingURL=in_memory_channel.js.map