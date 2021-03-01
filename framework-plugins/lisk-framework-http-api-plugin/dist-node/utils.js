"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateList = (list, limit = 100, offset = 0) => {
    if (offset === 0) {
        return list.slice(0, Math.min(limit, list.length));
    }
    return list.slice(offset, Math.min(limit + offset, list.length));
};
//# sourceMappingURL=utils.js.map