"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenesisBlockSchema = exports.getGenesisBlockJSON = exports.createGenesisBlock = void 0;
const create_1 = require("./create");
Object.defineProperty(exports, "createGenesisBlock", { enumerable: true, get: function () { return create_1.createGenesisBlock; } });
Object.defineProperty(exports, "getGenesisBlockJSON", { enumerable: true, get: function () { return create_1.getGenesisBlockJSON; } });
Object.defineProperty(exports, "getGenesisBlockSchema", { enumerable: true, get: function () { return create_1.getGenesisBlockSchema; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map