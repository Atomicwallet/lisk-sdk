"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findObjectByPath = (message, pathArr) => {
    let result = message;
    for (let i = 0; i < pathArr.length; i += 1) {
        if (result[pathArr[i]] === undefined) {
            return undefined;
        }
        result = result[pathArr[i]];
    }
    return result;
};
//# sourceMappingURL=find_path.js.map