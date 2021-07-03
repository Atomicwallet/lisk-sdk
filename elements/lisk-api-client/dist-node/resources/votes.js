"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotesResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class VotesResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/votes';
        this.get = api_method_1.apiMethod({
            method: constants_1.GET,
        }).bind(this);
    }
}
exports.VotesResource = VotesResource;
//# sourceMappingURL=votes.js.map