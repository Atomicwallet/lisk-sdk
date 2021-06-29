"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_SINT64 = exports.MAX_SINT64 = exports.MAX_UINT64 = exports.MAX_UINT32 = exports.MIN_SINT32 = exports.MAX_SINT32 = void 0;
exports.MAX_SINT32 = 2147483647;
exports.MIN_SINT32 = exports.MAX_SINT32 * -1;
exports.MAX_UINT32 = 4294967295;
exports.MAX_UINT64 = BigInt('18446744073709551615');
exports.MAX_SINT64 = BigInt('9223372036854775807');
exports.MIN_SINT64 = exports.MAX_SINT64 * BigInt(-1) - BigInt(1);
//# sourceMappingURL=constants.js.map