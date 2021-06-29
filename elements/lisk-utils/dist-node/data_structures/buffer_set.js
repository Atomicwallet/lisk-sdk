"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferSet = void 0;
const buffer_string_1 = require("./buffer_string");
const cloneDeep = require("lodash.clonedeep");
class BufferSet {
    constructor(data) {
        this._data = {};
        this._data = {};
        if (data) {
            for (const d of data) {
                this.add(d);
            }
        }
    }
    delete(key) {
        delete this._data[buffer_string_1.keyString(key)];
    }
    add(value) {
        this._data[buffer_string_1.keyString(value)] = value;
    }
    has(value) {
        return this._data[buffer_string_1.keyString(value)] !== undefined;
    }
    clone() {
        return new BufferSet(cloneDeep(Object.values(this._data)));
    }
    get size() {
        return Object.keys(this._data).length;
    }
    [Symbol.iterator]() {
        let index = -1;
        const data = Object.values(this._data);
        return {
            next: () => {
                index += 1;
                return {
                    value: data[index],
                    done: !(index in data),
                };
            },
        };
    }
}
exports.BufferSet = BufferSet;
//# sourceMappingURL=buffer_set.js.map