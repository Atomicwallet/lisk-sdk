"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignaturesResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class SignaturesResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/signatures';
        this.broadcast = api_method_1.apiMethod({
            method: constants_1.POST,
        }).bind(this);
    }
}
exports.SignaturesResource = SignaturesResource;
//# sourceMappingURL=signatures.js.map