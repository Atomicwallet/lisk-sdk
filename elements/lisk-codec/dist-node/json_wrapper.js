"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recursiveTypeCast = exports.iterator = void 0;
const mappers = {
    toJSON: {
        uint32: value => value,
        sint32: value => value,
        uint64: value => value.toString(),
        sint64: value => value.toString(),
        string: value => value,
        bytes: value => value.toString('hex'),
        boolean: value => value,
    },
    fromJSON: {
        uint32: value => value,
        sint32: value => value,
        uint64: value => BigInt(value),
        sint64: value => BigInt(value),
        string: value => value,
        bytes: value => Buffer.from(value, 'hex'),
        boolean: value => value,
    },
};
const findObjectByPath = (message, pathArr) => {
    let result = message;
    for (let i = 0; i < pathArr.length; i += 1) {
        if (!result.properties && !result.items) {
            return undefined;
        }
        if (result.properties) {
            result = result.properties[pathArr[i]];
        }
        else if (result.items) {
            const x = result.items.properties;
            result = x[pathArr[i]];
        }
    }
    return result;
};
const isObject = (item) => typeof item === 'object' && item !== null && !Array.isArray(item) && !Buffer.isBuffer(item);
const iterator = function iterator() {
    let index = 0;
    const properties = Object.keys(this);
    let Done = false;
    return {
        next: () => {
            Done = index >= properties.length;
            const obj = {
                done: Done,
                value: { value: this[properties[index]], key: properties[index] },
            };
            index += 1;
            return obj;
        },
    };
};
exports.iterator = iterator;
const recursiveTypeCast = (mode, object, schema, dataPath) => {
    var _a;
    for (const { key, value } of object) {
        if (isObject(value)) {
            dataPath.push(key);
            value[Symbol.iterator] = exports.iterator;
            exports.recursiveTypeCast(mode, value, schema, dataPath);
            dataPath.pop();
            delete value[Symbol.iterator];
        }
        else if (Array.isArray(value)) {
            dataPath.push(key);
            const schemaProp = findObjectByPath(schema, dataPath);
            if (((_a = schemaProp === null || schemaProp === void 0 ? void 0 : schemaProp.items) === null || _a === void 0 ? void 0 : _a.type) === 'object') {
                for (let i = 0; i < value.length; i += 1) {
                    const arrayObject = value[i];
                    arrayObject[Symbol.iterator] = exports.iterator;
                    exports.recursiveTypeCast(mode, arrayObject, schema, dataPath);
                    delete arrayObject[Symbol.iterator];
                }
            }
            else {
                for (let i = 0; i < value.length; i += 1) {
                    if (schemaProp === undefined || schemaProp.items === undefined) {
                        throw new Error(`Invalid schema property found. Path: ${dataPath.join(',')}`);
                    }
                    object[key][i] = mappers[mode][schemaProp.items.dataType](value[i]);
                }
            }
            dataPath.pop();
        }
        else {
            dataPath.push(key);
            const schemaProp = findObjectByPath(schema, dataPath);
            if (schemaProp === undefined) {
                throw new Error(`Invalid schema property found. Path: ${dataPath.join(',')}`);
            }
            object[key] = mappers[mode][schemaProp.dataType](value);
            delete object[Symbol.iterator];
            dataPath.pop();
        }
    }
    delete object[Symbol.iterator];
};
exports.recursiveTypeCast = recursiveTypeCast;
//# sourceMappingURL=json_wrapper.js.map