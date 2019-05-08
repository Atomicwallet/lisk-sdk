"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var api_method_1 = require("../api_method");
var api_resource_1 = require("../api_resource");
var constants_1 = require("../constants");
var DelegatesResource = (function (_super) {
    __extends(DelegatesResource, _super);
    function DelegatesResource(apiClient) {
        var _this = _super.call(this, apiClient) || this;
        _this.path = '/delegates';
        _this.get = api_method_1.apiMethod({
            defaultData: {
                sort: 'rank:asc',
            },
            method: constants_1.GET,
        }).bind(_this);
        _this.getStandby = api_method_1.apiMethod({
            defaultData: {
                offset: 101,
                sort: 'rank:asc',
            },
            method: constants_1.GET,
        }).bind(_this);
        _this.getForgers = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/forgers',
        }).bind(_this);
        _this.getForgingStatistics = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/{address}/forging_statistics',
            urlParams: ['address'],
        }).bind(_this);
        return _this;
    }
    return DelegatesResource;
}(api_resource_1.APIResource));
exports.DelegatesResource = DelegatesResource;
//# sourceMappingURL=delegates.js.map