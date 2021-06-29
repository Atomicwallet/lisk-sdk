"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRPCError = void 0;
const convertRPCError = (error) => new Error(typeof error.data === 'string' ? error.data : error.message);
exports.convertRPCError = convertRPCError;
//# sourceMappingURL=utils.js.map