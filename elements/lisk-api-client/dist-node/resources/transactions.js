"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class TransactionsResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/transactions';
        this.get = api_method_1.apiMethod({
            method: constants_1.GET,
        }).bind(this);
        this.broadcast = api_method_1.apiMethod({
            method: constants_1.POST,
        }).bind(this);
    }
}
exports.TransactionsResource = TransactionsResource;
//# sourceMappingURL=transactions.js.map