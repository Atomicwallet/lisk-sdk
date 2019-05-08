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
var NodeResource = (function (_super) {
    __extends(NodeResource, _super);
    function NodeResource(apiClient) {
        var _this = _super.call(this, apiClient) || this;
        _this.path = '/node';
        _this.getConstants = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/constants',
        }).bind(_this);
        _this.getStatus = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/status',
        }).bind(_this);
        _this.getForgingStatus = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/status/forging',
        }).bind(_this);
        _this.updateForgingStatus = api_method_1.apiMethod({
            method: constants_1.PUT,
            path: '/status/forging',
        }).bind(_this);
        _this.getTransactions = api_method_1.apiMethod({
            method: constants_1.GET,
            path: '/transactions/{state}',
            urlParams: ['state'],
        }).bind(_this);
        return _this;
    }
    return NodeResource;
}(api_resource_1.APIResource));
exports.NodeResource = NodeResource;
//# sourceMappingURL=node.js.map