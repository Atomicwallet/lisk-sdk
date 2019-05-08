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
var TransactionError = (function (_super) {
    __extends(TransactionError, _super);
    function TransactionError(message, id, dataPath, actual, expected) {
        if (message === void 0) { message = ''; }
        if (id === void 0) { id = ''; }
        if (dataPath === void 0) { dataPath = ''; }
        var _this = _super.call(this) || this;
        _this.message = message;
        _this.name = 'TransactionError';
        _this.id = id;
        _this.dataPath = dataPath;
        _this.actual = actual;
        _this.expected = expected;
        return _this;
    }
    TransactionError.prototype.toString = function () {
        var defaultMessage = "Transaction: " + this.id + " failed at " + this.dataPath + ": " + this.message;
        var withActual = this.actual
            ? defaultMessage + ", actual: " + this.actual
            : defaultMessage;
        var withExpected = this.expected
            ? withActual + ", expected: " + this.expected
            : withActual;
        return withExpected;
    };
    return TransactionError;
}(Error));
exports.TransactionError = TransactionError;
var TransactionPendingError = (function (_super) {
    __extends(TransactionPendingError, _super);
    function TransactionPendingError(message, id, dataPath) {
        if (message === void 0) { message = ''; }
        if (id === void 0) { id = ''; }
        if (dataPath === void 0) { dataPath = ''; }
        var _this = _super.call(this, message) || this;
        _this.name = 'TransactionPendingError';
        _this.id = id;
        _this.dataPath = dataPath;
        return _this;
    }
    TransactionPendingError.prototype.toString = function () {
        return "Transaction: " + this.id + " failed at " + this.dataPath + ": " + this.message + " ";
    };
    return TransactionPendingError;
}(TransactionError));
exports.TransactionPendingError = TransactionPendingError;
exports.convertToTransactionError = function (id, errors) {
    if (!errors) {
        return [];
    }
    return errors.map(function (error) {
        return new TransactionError("'" + error.dataPath + "' " + error.message, id, error.dataPath);
    });
};
exports.convertToAssetError = function (id, errors) {
    if (!errors) {
        return [];
    }
    return errors.map(function (error) {
        return new TransactionError("'" + (error.dataPath || '.asset') + "' " + error.message, id, error.dataPath || '.asset');
    });
};
//# sourceMappingURL=errors.js.map