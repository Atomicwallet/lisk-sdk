"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
class Node {
    constructor(channel) {
        this._channel = channel;
    }
    async getNodeInfo() {
        return this._channel.invoke('app:getNodeInfo');
    }
    async getNetworkStats() {
        return this._channel.invoke('app:getNetworkStats');
    }
    async getConnectedPeers() {
        return this._channel.invoke('app:getConnectedPeers');
    }
    async getDisconnectedPeers() {
        return this._channel.invoke('app:getDisconnectedPeers');
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map