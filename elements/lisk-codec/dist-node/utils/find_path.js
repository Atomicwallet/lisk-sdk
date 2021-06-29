"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findObjectByPath = void 0;
const findObjectByPath = (message, pathArr) => {
    let result = message;
    for (let i = 0; i < pathArr.length; i += 1) {
        if (result[pathArr[i]] === undefined) {
            return undefined;
        }
        result = result[pathArr[i]];
    }
    return result;
};
exports.findObjectByPath = findObjectByPath;
//# sourceMappingURL=find_path.js.map