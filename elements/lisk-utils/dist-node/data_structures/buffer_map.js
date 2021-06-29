"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferMap = void 0;
const buffer_string_1 = require("./buffer_string");
const cloneDeep = require("lodash.clonedeep");
class BufferMap {
    constructor(data) {
        this._data = {};
        this._data = data !== null && data !== void 0 ? data : {};
    }
    get size() {
        return Object.keys(this._data).length;
    }
    get(key) {
        return this._data[buffer_string_1.keyString(key)];
    }
    delete(key) {
        delete this._data[buffer_string_1.keyString(key)];
    }
    set(key, value) {
        this._data[buffer_string_1.keyString(key)] = value;
    }
    has(key) {
        return this._data[buffer_string_1.keyString(key)] !== undefined;
    }
    clone() {
        return new BufferMap(cloneDeep(this._data));
    }
    entries() {
        return Object.entries(this._data).map(([key, value]) => [
            Buffer.from(key, 'binary'),
            value,
        ]);
    }
    values() {
        return Object.values(this._data);
    }
}
exports.BufferMap = BufferMap;
//# sourceMappingURL=buffer_map.js.map