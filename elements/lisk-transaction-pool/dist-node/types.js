"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = exports.Status = void 0;
var Status;
(function (Status) {
    Status[Status["FAIL"] = 0] = "FAIL";
    Status[Status["OK"] = 1] = "OK";
})(Status = exports.Status || (exports.Status = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus[TransactionStatus["INVALID"] = 0] = "INVALID";
    TransactionStatus[TransactionStatus["UNPROCESSABLE"] = 1] = "UNPROCESSABLE";
    TransactionStatus[TransactionStatus["PROCESSABLE"] = 2] = "PROCESSABLE";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
//# sourceMappingURL=types.js.map