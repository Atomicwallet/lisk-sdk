"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_set_1 = require("../data_structures/buffer_set");
exports.bufferArrayIncludes = (arr, val) => arr.find(a => a.equals(val)) !== undefined;
exports.bufferArrayContains = (arr1, arr2) => arr2.every(val => exports.bufferArrayIncludes(arr1, val));
exports.bufferArrayContainsSome = (arr1, arr2) => arr2.some(val => exports.bufferArrayIncludes(arr1, val));
exports.bufferArrayEqual = (arr1, arr2) => arr1.length === arr2.length && arr1.every((val, index) => val.equals(arr2[index]));
exports.bufferArraySubtract = (arr1, arr2) => arr1.filter(a => !exports.bufferArrayIncludes(arr2, a));
exports.bufferArrayOrderByLex = (arr1) => {
    const sortedArray = [...arr1];
    sortedArray.sort((a, b) => a.compare(b));
    return exports.bufferArrayEqual(arr1, sortedArray);
};
exports.bufferArrayUniqueItems = (arr1) => arr1.length === new buffer_set_1.BufferSet([...arr1]).size;
//# sourceMappingURL=buffer_array.js.map