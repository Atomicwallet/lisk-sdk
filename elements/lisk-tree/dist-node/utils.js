"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const constants_1 = require("./constants");
exports.isLeaf = (value) => value[0] === constants_1.LEAF_PREFIX[0];
exports.generateHash = (prefix, leftHash, rightHash) => lisk_cryptography_1.hash(Buffer.concat([prefix, leftHash, rightHash], prefix.length + leftHash.length + rightHash.length));
exports.getMaxIdxAtLayer = (layer, dataLength) => {
    let [max, r] = [dataLength, 0];
    for (let i = 0; i < layer; i += 1) {
        [max, r] = [[Math.floor, Math.ceil][r % 2](max / 2), r + (max % 2)];
    }
    return max;
};
exports.getLayerStructure = (dataLength) => {
    const structure = [];
    for (let i = 0; i <= Math.ceil(Math.log2(dataLength)); i += 1) {
        structure.push(exports.getMaxIdxAtLayer(i, dataLength));
    }
    return structure;
};
exports.getBinaryString = (num, length) => {
    if (length === 0) {
        return '';
    }
    let binaryString = num.toString(2);
    while (binaryString.length < length)
        binaryString = `0${binaryString}`;
    return binaryString;
};
exports.getBinary = (num, length) => {
    const binaryString = exports.getBinaryString(num, length);
    return binaryString.split('').map(d => parseInt(d, 10));
};
exports.getPairLocation = (nodeInfo) => {
    const { layerIndex, nodeIndex, dataLength } = nodeInfo;
    const treeHeight = Math.ceil(Math.log2(dataLength)) + 1;
    const layerStructure = exports.getLayerStructure(dataLength);
    const numberOfNodesInLayer = layerStructure[layerIndex];
    const binary = exports.getBinary(nodeIndex, treeHeight - layerIndex);
    const side = [0, 1][binary[binary.length - 1]];
    const pairSide = side === 0 ? 1 : 0;
    if (layerIndex + 1 === treeHeight) {
        return { layerIndex: treeHeight - 1, nodeIndex: 0 };
    }
    if (side === 0 && nodeIndex < numberOfNodesInLayer - 1) {
        const pairNodeIndex = nodeIndex + 1;
        return { layerIndex, nodeIndex: pairNodeIndex, side: pairSide };
    }
    if (side === 1 &&
        ((numberOfNodesInLayer % 2 === 0 && nodeIndex === numberOfNodesInLayer - 1) ||
            (nodeIndex < numberOfNodesInLayer - 1 && nodeIndex < numberOfNodesInLayer - 1))) {
        const pairNodeIndex = nodeIndex - 1;
        return { layerIndex, nodeIndex: pairNodeIndex, side: pairSide };
    }
    let currentLayer = layerIndex;
    const numOfOddLayers = layerStructure
        .slice(0, currentLayer)
        .filter(num => num % 2 !== 0)
        .reduce((acc, val) => acc + val, 0);
    const direction = numOfOddLayers % 2 === 0 ? 1 : -1;
    let pairLocation;
    currentLayer += direction;
    while (currentLayer >= 0 && currentLayer <= treeHeight - 1) {
        if (layerStructure[currentLayer] % 2 !== 0) {
            const pairNodeIndex = direction === 1
                ? layerStructure[currentLayer] + direction * -1
                : layerStructure[currentLayer] - direction * -1;
            pairLocation = {
                layerIndex: currentLayer,
                nodeIndex: pairNodeIndex,
                side: direction === -1 ? 1 : 0,
            };
            break;
        }
        currentLayer += direction;
    }
    return pairLocation;
};
//# sourceMappingURL=utils.js.map