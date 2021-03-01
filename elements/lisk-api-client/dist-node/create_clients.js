"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_client_1 = require("./api_client");
const ipc_channel_1 = require("./ipc_channel");
const ws_channel_1 = require("./ws_channel");
exports.createClient = async (channel) => {
    const client = new api_client_1.APIClient(channel);
    await client.init();
    return client;
};
exports.createIPCClient = async (dataPath) => {
    const ipcChannel = new ipc_channel_1.IPCChannel(dataPath);
    await ipcChannel.connect();
    return exports.createClient(ipcChannel);
};
exports.createWSClient = async (url) => {
    const wsChannel = new ws_channel_1.WSChannel(url);
    await wsChannel.connect();
    return exports.createClient(wsChannel);
};
//# sourceMappingURL=create_clients.js.map