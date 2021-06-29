"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const utils_1 = require("./utils");
class NotFoundError extends Error {
    constructor(key) {
        super(`Specified key ${utils_1.smartConvert(key, ':', 'hex')} does not exist`);
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=errors.js.map