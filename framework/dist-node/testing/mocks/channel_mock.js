"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.channelMock = void 0;
exports.channelMock = {
    publish: (_name, _data) => { },
    registerToBus: async (_arg) => Promise.resolve(),
    isValidEventName: (_name, _throwError = true) => true,
    isValidActionName: (_name, _throwError = true) => true,
    eventsList: [],
    actionsList: [],
    actions: {},
    moduleAlias: '',
    options: {},
    once: (_event) => { },
    subscribe: (_event) => { },
    invoke: async (_name, _params) => Promise.resolve({}),
};
//# sourceMappingURL=channel_mock.js.map