"use strict";
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
var axios_1 = require("axios");
var errors_1 = require("./errors");
var API_RECONNECT_MAX_RETRY_COUNT = 3;
var REQUEST_RETRY_TIMEOUT = 1000;
var APIResource = (function () {
    function APIResource(apiClient) {
        this.apiClient = apiClient;
        this.path = '';
    }
    Object.defineProperty(APIResource.prototype, "headers", {
        get: function () {
            return this.apiClient.headers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(APIResource.prototype, "resourcePath", {
        get: function () {
            return this.apiClient.currentNode + "/api" + this.path;
        },
        enumerable: true,
        configurable: true
    });
    APIResource.prototype.handleRetry = function (error, req, retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.apiClient.hasAvailableNodes()) {
                    return [2, new Promise(function (resolve) {
                            return setTimeout(resolve, REQUEST_RETRY_TIMEOUT);
                        }).then(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (retryCount > API_RECONNECT_MAX_RETRY_COUNT) {
                                    throw error;
                                }
                                if (this.apiClient.randomizeNodes) {
                                    this.apiClient.banActiveNodeAndSelect();
                                }
                                return [2, this.request(req, true, retryCount + 1)];
                            });
                        }); })];
                }
                return [2, Promise.reject(error)];
            });
        });
    };
    APIResource.prototype.request = function (req, retry, retryCount) {
        if (retryCount === void 0) { retryCount = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var request;
            var _this = this;
            return __generator(this, function (_a) {
                request = axios_1.default.request(req)
                    .then(function (res) { return res.data; })
                    .catch(function (error) {
                    if (error.response) {
                        var status_1 = error.response.status;
                        if (error.response.data) {
                            var _a = error.response.data, errorString = _a.error, errors = _a.errors, message = _a.message;
                            throw new errors_1.APIError(message || errorString || 'An unknown error has occurred.', status_1, errors);
                        }
                        throw new errors_1.APIError('An unknown error has occurred.', status_1);
                    }
                    throw error;
                });
                if (retry) {
                    return [2, request.catch(function (err) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2, this.handleRetry(err, req, retryCount)];
                        }); }); })];
                }
                return [2, request];
            });
        });
    };
    return APIResource;
}());
exports.APIResource = APIResource;
//# sourceMappingURL=api_resource.js.map