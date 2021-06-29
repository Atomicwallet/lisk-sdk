"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferArrayUniqueItems = exports.bufferArrayOrderByLex = exports.bufferArraySubtract = exports.bufferArrayEqual = exports.bufferArrayContainsSome = exports.bufferArrayContains = exports.bufferArrayIncludes = void 0;
const buffer_set_1 = require("../data_structures/buffer_set");
const bufferArrayIncludes = (arr, val) => arr.find(a => a.equals(val)) !== undefined;
exports.bufferArrayIncludes = bufferArrayIncludes;
const bufferArrayContains = (arr1, arr2) => arr2.every(val => exports.bufferArrayIncludes(arr1, val));
exports.bufferArrayContains = bufferArrayContains;
const bufferArrayContainsSome = (arr1, arr2) => arr2.some(val => exports.bufferArrayIncludes(arr1, val));
exports.bufferArrayContainsSome = bufferArrayContainsSome;
const bufferArrayEqual = (arr1, arr2) => arr1.length === arr2.length && arr1.every((val, index) => val.equals(arr2[index]));
exports.bufferArrayEqual = bufferArrayEqual;
const bufferArraySubtract = (arr1, arr2) => arr1.filter(a => !exports.bufferArrayIncludes(arr2, a));
exports.bufferArraySubtract = bufferArraySubtract;
const bufferArrayOrderByLex = (arr1) => {
    const sortedArray = [...arr1];
    sortedArray.sort((a, b) => a.compare(b));
    return exports.bufferArrayEqual(arr1, sortedArray);
};
exports.bufferArrayOrderByLex = bufferArrayOrderByLex;
const bufferArrayUniqueItems = (arr1) => arr1.length === new buffer_set_1.BufferSet([...arr1]).size;
exports.bufferArrayUniqueItems = bufferArrayUniqueItems;
//# sourceMappingURL=buffer_array.js.map