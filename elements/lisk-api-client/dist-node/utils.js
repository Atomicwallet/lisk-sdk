"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRPCError = (error) => new Error(typeof error.data === 'string' ? error.data : error.message);
//# sourceMappingURL=utils.js.map