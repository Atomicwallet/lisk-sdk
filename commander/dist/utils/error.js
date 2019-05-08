"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var FileSystemError = (function (_super) {
    tslib_1.__extends(FileSystemError, _super);
    function FileSystemError(message) {
        var _this = _super.call(this, message) || this;
        _this.message = chalk_1.default.red(message);
        _this.name = 'FileSystemError';
        return _this;
    }
    return FileSystemError;
}(Error));
exports.FileSystemError = FileSystemError;
var ValidationError = (function (_super) {
    tslib_1.__extends(ValidationError, _super);
    function ValidationError(message) {
        var _this = _super.call(this, message) || this;
        _this.message = chalk_1.default.red(message);
        _this.name = 'ValidationError';
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
//# sourceMappingURL=error.js.map