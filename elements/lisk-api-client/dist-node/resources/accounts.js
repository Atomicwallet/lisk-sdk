"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class AccountsResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/accounts';
        this.get = api_method_1.apiMethod({
            method: constants_1.GET,
        }).bind(this);
        this.getMultisignatureGroups = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/{address}/multisignature_groups',
            urlParams: ['address'],
        }).bind(this);
        this.getMultisignatureMemberships = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/{address}/multisignature_memberships',
            urlParams: ['address'],
        }).bind(this);
    }
}
exports.AccountsResource = AccountsResource;
//# sourceMappingURL=accounts.js.map