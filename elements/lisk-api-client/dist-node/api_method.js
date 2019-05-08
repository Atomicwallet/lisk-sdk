"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var utils_1 = require("./utils");
exports.apiMethod = function (options) {
    if (options === void 0) { options = {}; }
    return function apiHandler() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a, method, _b, path, _c, urlParams, validator, _d, defaultData, _e, retry, data, resolvedURLObject, requestData;
            return __generator(this, function (_f) {
                _a = options.method, method = _a === void 0 ? constants_1.GET : _a, _b = options.path, path = _b === void 0 ? '' : _b, _c = options.urlParams, urlParams = _c === void 0 ? [] : _c, validator = options.validator, _d = options.defaultData, defaultData = _d === void 0 ? {} : _d, _e = options.retry, retry = _e === void 0 ? false : _e;
                if (urlParams.length > 0 && args.length < urlParams.length) {
                    return [2, Promise.reject(new Error("This endpoint must be supplied with the following parameters: " + urlParams.toString()))];
                }
                data = __assign({}, defaultData, (args.length > urlParams.length &&
                    typeof args[urlParams.length] === 'object'
                    ? args[urlParams.length]
                    : {}));
                if (validator) {
                    try {
                        validator(data);
                    }
                    catch (err) {
                        return [2, Promise.reject(err)];
                    }
                }
                resolvedURLObject = urlParams.reduce(function (accumulator, param, i) {
                    var _a;
                    var value = args[i];
                    if (typeof value !== 'string' && typeof value !== 'number') {
                        throw new Error('Parameter must be a string or a number');
                    }
                    return __assign({}, accumulator, (_a = {}, _a[param] = typeof value === 'number' ? value.toString() : value, _a));
                }, {});
                requestData = {
                    headers: this.headers,
                    method: method,
                    url: utils_1.solveURLParams("" + this.resourcePath + path, resolvedURLObject),
                };
                if (Object.keys(data).length > 0) {
                    if (method === constants_1.GET) {
                        requestData.url += "?" + utils_1.toQueryString(data);
                    }
                    else {
                        requestData.data = data;
                    }
                }
                return [2, this.request(requestData, retry)];
            });
        });
    };
};
//# sourceMappingURL=api_method.js.map