"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProof = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const verifyProof = (options) => {
    const { path, indexes, dataLength } = options.proof;
    const treeHeight = Math.ceil(Math.log2(dataLength)) + 1;
    const results = new lisk_utils_1.dataStructures.BufferMap();
    if (dataLength === 0 || options.queryData.length === 0) {
        return [{ hash: options.rootHash, verified: true }];
    }
    const locationToPathMap = {};
    for (const p of path) {
        if (p.layerIndex !== undefined && p.nodeIndex !== undefined) {
            locationToPathMap[`${utils_1.getBinaryString(p.nodeIndex, treeHeight - p.layerIndex)}`] = p.hash;
        }
    }
    for (let i = 0; i < options.queryData.length; i += 1) {
        const queryHash = options.queryData[i];
        let { nodeIndex, layerIndex } = indexes[i];
        if (nodeIndex === undefined || layerIndex === undefined) {
            results.set(queryHash, false);
            continue;
        }
        if (dataLength === 1) {
            if (path.some(p => p.hash.equals(queryHash))) {
                results.set(queryHash, true);
            }
            else {
                results.set(queryHash, false);
            }
            continue;
        }
        let currentHash = queryHash;
        while (layerIndex !== treeHeight) {
            const { layerIndex: pairLayerIndex, nodeIndex: pairNodeIndex, side: pairSide, } = utils_1.getPairLocation({ layerIndex, nodeIndex, dataLength });
            const nextPath = locationToPathMap[`${utils_1.getBinaryString(pairNodeIndex, treeHeight - pairLayerIndex)}`];
            if (nextPath === undefined) {
                break;
            }
            const leftHashBuffer = pairSide === 0 ? nextPath : currentHash;
            const rightHashBuffer = pairSide === 1 ? nextPath : currentHash;
            currentHash = utils_1.generateHash(constants_1.BRANCH_PREFIX, leftHashBuffer, rightHashBuffer);
            layerIndex = pairLayerIndex > layerIndex ? pairLayerIndex + 1 : layerIndex + 1;
            nodeIndex =
                dataLength === 2 ** (treeHeight - 1)
                    ? Math.floor(pairNodeIndex / 2)
                    : Math.floor(pairNodeIndex / 2 ** (layerIndex - pairLayerIndex));
        }
        if (!currentHash.equals(options.rootHash)) {
            results.set(queryHash, false);
            continue;
        }
        results.set(queryHash, true);
    }
    return results.entries().map(result => ({ hash: result[0], verified: result[1] }));
};
exports.verifyProof = verifyProof;
//# sourceMappingURL=verify_proof.js.map