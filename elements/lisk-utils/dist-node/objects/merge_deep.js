"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDeep = void 0;
const isIterable = (item) => typeof item === 'object' && item !== null && !Array.isArray(item) && !Buffer.isBuffer(item);
const mergeDeep = (dest, ...srcs) => {
    const result = dest;
    if (!isIterable(result)) {
        return result;
    }
    for (const src of srcs) {
        for (const key in src) {
            if (isIterable(src[key])) {
                if (!result[key]) {
                    result[key] = {};
                }
                exports.mergeDeep(result[key], src[key]);
            }
            else if (src[key] !== undefined && src[key] !== null) {
                result[key] = src[key];
            }
        }
    }
    return result;
};
exports.mergeDeep = mergeDeep;
//# sourceMappingURL=merge_deep.js.map