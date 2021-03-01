"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("@liskhq/lisk-db");
const path_1 = require("./path");
exports.getBlockchainDB = (dataPath) => new db.KVStore(path_1.getBlockchainDBPath(dataPath));
//# sourceMappingURL=db.js.map