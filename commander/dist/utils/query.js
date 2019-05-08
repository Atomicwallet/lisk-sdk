"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var isArray = function (val) {
    return Array.isArray(val);
};
exports.handleResponse = function (endpoint, res, placeholder) {
    if (!res.data) {
        throw new Error('No data was returned.');
    }
    if (isArray(res.data)) {
        if (res.data.length === 0) {
            if (placeholder) {
                return placeholder;
            }
            throw new Error("No " + endpoint + " found using specified parameters.");
        }
        if (res.data.length > 1) {
            return res.data;
        }
        return res.data[0];
    }
    return res.data;
};
exports.query = function (client, endpoint, parameters) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return tslib_1.__generator(this, function (_a) {
        return [2, isArray(parameters)
                ? Promise.all(parameters.map(function (param) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        return [2, client[endpoint]
                                .get(param.query)
                                .then(function (res) {
                                return exports.handleResponse(endpoint, res, param.placeholder);
                            })];
                    });
                }); }))
                : client[endpoint]
                    .get(parameters.query)
                    .then(function (res) {
                    return exports.handleResponse(endpoint, res, parameters.placeholder);
                })];
    });
}); };
exports.queryNodeTransaction = function (client, txnState, parameters) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return tslib_1.__generator(this, function (_a) {
        return [2, Promise.all(parameters.map(function (param) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2, client
                            .getTransactions(txnState, param.query)
                            .then(function (res) {
                            return exports.handleResponse('node/transactions', res, param.placeholder);
                        })];
                });
            }); }))];
    });
}); };
//# sourceMappingURL=query.js.map