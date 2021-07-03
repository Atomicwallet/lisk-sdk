"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DappsResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class DappsResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/dapps';
        this.get = api_method_1.apiMethod({
            method: constants_1.GET,
        }).bind(this);
    }
}
exports.DappsResource = DappsResource;
//# sourceMappingURL=dapps.js.map