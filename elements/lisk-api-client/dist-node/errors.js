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
var defaultErrorNo = 500;
var APIError = (function (_super) {
    __extends(APIError, _super);
    function APIError(message, errno, errors) {
        if (message === void 0) { message = ''; }
        if (errno === void 0) { errno = defaultErrorNo; }
        var _this = _super.call(this, message) || this;
        _this.name = 'APIError';
        _this.errno = errno;
        _this.errors = errors;
        return _this;
    }
    return APIError;
}(Error));
exports.APIError = APIError;
//# sourceMappingURL=errors.js.map