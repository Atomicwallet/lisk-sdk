"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeersResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class PeersResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/peers';
        this.get = api_method_1.apiMethod({
            method: constants_1.GET,
        }).bind(this);
    }
}
exports.PeersResource = PeersResource;
//# sourceMappingURL=peers.js.map