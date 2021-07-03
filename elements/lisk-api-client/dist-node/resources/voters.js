"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotersResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class VotersResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/voters';
        this.get = api_method_1.apiMethod({
            method: constants_1.GET,
        }).bind(this);
    }
}
exports.VotersResource = VotersResource;
//# sourceMappingURL=voters.js.map