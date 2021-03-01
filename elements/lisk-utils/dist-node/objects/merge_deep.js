"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isIterable = (item) => typeof item === 'object' && item !== null && !Array.isArray(item) && !Buffer.isBuffer(item);
exports.mergeDeep = (dest, ...srcs) => {
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
//# sourceMappingURL=merge_deep.js.map