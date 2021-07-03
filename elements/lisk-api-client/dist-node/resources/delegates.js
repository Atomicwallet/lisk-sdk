"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegatesResource = void 0;
const api_method_1 = require("../api_method");
const api_resource_1 = require("../api_resource");
const constants_1 = require("../constants");
class DelegatesResource extends api_resource_1.APIResource {
    constructor(apiClient) {
        super(apiClient);
        this.path = '/delegates';
        this.get = api_method_1.apiMethod({
            defaultData: {
                sort: 'rank:asc',
            },
            method: constants_1.GET,
        }).bind(this);
        this.getStandby = api_method_1.apiMethod({
            defaultData: {
                offset: 101,
                sort: 'rank:asc',
            },
            method: constants_1.GET,
        }).bind(this);
        this.getForgers = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/forgers',
        }).bind(this);
        this.getForgingStatistics = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/{address}/forging_statistics',
            urlParams: ['address'],
        }).bind(this);
    }
}
exports.DelegatesResource = DelegatesResource;
//# sourceMappingURL=delegates.js.map