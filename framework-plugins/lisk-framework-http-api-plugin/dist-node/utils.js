"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateList = void 0;
const paginateList = (list, limit = 100, offset = 0) => {
    if (offset === 0) {
        return list.slice(0, Math.min(limit, list.length));
    }
    return list.slice(offset, Math.min(limit + offset, list.length));
};
exports.paginateList = paginateList;
//# sourceMappingURL=utils.js.map