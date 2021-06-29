"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockchainDB = void 0;
const db = require("@liskhq/lisk-db");
const path_1 = require("./path");
const getBlockchainDB = (dataPath) => new db.KVStore(path_1.getBlockchainDBPath(dataPath));
exports.getBlockchainDB = getBlockchainDB;
//# sourceMappingURL=db.js.map