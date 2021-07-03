"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class NodeResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/node';
        this.getConstants = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/constants',
        }).bind(this);
        this.getStatus = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/status',
        }).bind(this);
        this.getForgingStatus = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/status/forging',
        }).bind(this);
        this.updateForgingStatus = api_method_1.apiMethod({
            method: constants_1.PUT,
            path: '/status/forging',
        }).bind(this);
        this.getTransactions = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/transactions/{state}',
            urlParams: ['state'],
        }).bind(this);
    }
}
exports.NodeResource = NodeResource;
//# sourceMappingURL=node.js.map