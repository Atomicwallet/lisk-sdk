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
var PeersResource = (function (_super) {
    __extends(PeersResource, _super);
    function PeersResource(apiClient) {
        var _this = _super.call(this, apiClient) || this;
        _this.path = '/peers';
        _this.get = api_method_1.apiMethod({
            method: constants_1.GET,
        }).bind(_this);
        return _this;
    }
    return PeersResource;
}(api_resource_1.APIResource));
exports.PeersResource = PeersResource;
//# sourceMappingURL=peers.js.map