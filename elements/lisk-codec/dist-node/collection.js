"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeArray = exports.readArray = exports.readObject = exports.writeObject = void 0;
const varint_1 = require("./varint");
const string_1 = require("./string");
const bytes_1 = require("./bytes");
const boolean_1 = require("./boolean");
const keys_1 = require("./keys");
const default_value_1 = require("./utils/default_value");
const _readers = {
    uint32: varint_1.readUInt32,
    sint32: varint_1.readSInt32,
    uint64: varint_1.readUInt64,
    sint64: varint_1.readSInt64,
    string: string_1.readString,
    bytes: bytes_1.readBytes,
    boolean: boolean_1.readBoolean,
};
const _writers = {
    uint32: varint_1.writeUInt32,
    sint32: varint_1.writeSInt32,
    uint64: varint_1.writeUInt64,
    sint64: varint_1.writeSInt64,
    string: string_1.writeString,
    bytes: bytes_1.writeBytes,
    boolean: boolean_1.writeBoolean,
};
const writeObject = (compiledSchema, message, chunks) => {
    let simpleObjectSize = 0;
    for (let i = 0; i < compiledSchema.length; i += 1) {
        const property = compiledSchema[i];
        if (Array.isArray(property)) {
            const headerProp = property[0];
            if (headerProp.schemaProp.type === 'array') {
                const [, size] = exports.writeArray(property, message[headerProp.propertyName], chunks);
                simpleObjectSize += size;
                continue;
            }
            chunks.push(headerProp.binaryKey);
            const [encodedValues, totalWrittenSize] = exports.writeObject(property, message[headerProp.propertyName], []);
            const objectSize = _writers.uint32(totalWrittenSize);
            simpleObjectSize += objectSize.length + headerProp.binaryKey.length;
            chunks.push(objectSize);
            for (let e = 0; e < encodedValues.length; e += 1) {
                simpleObjectSize += encodedValues[e].length;
                chunks.push(encodedValues[e]);
            }
        }
        else {
            if (property.schemaProp.type === 'object') {
                continue;
            }
            const value = message[property.propertyName];
            if (value === undefined) {
                continue;
            }
            const { schemaProp: { dataType }, binaryKey, } = property;
            if (dataType === undefined) {
                throw new Error('Compiled Schema is corrupted as "dataType" can not be undefined.');
            }
            const binaryValue = _writers[dataType](value);
            chunks.push(binaryKey);
            chunks.push(binaryValue);
            simpleObjectSize += binaryKey.length + binaryValue.length;
        }
    }
    return [chunks, simpleObjectSize];
};
exports.writeObject = writeObject;
const readObject = (message, offset, compiledSchema, terminateIndex) => {
    let index = offset;
    const result = {};
    for (let i = 0; i < compiledSchema.length; i += 1) {
        const typeSchema = compiledSchema[i];
        if (Array.isArray(typeSchema)) {
            if (typeSchema[0].schemaProp.type === 'array') {
                if (index >= terminateIndex) {
                    result[typeSchema[0].propertyName] = [];
                    continue;
                }
                const [arr, nextOffset] = exports.readArray(message, index, typeSchema, terminateIndex);
                result[typeSchema[0].propertyName] = arr;
                index = nextOffset;
            }
            else if (typeSchema[0].schemaProp.type === 'object') {
                const [, keySize] = varint_1.readUInt32(message, index);
                index += keySize;
                const [objectSize, objectSizeLength] = varint_1.readUInt32(message, index);
                index += objectSizeLength;
                const [obj, nextOffset] = exports.readObject(message, index, typeSchema, objectSize + index);
                result[typeSchema[0].propertyName] = obj;
                index = nextOffset;
            }
            else {
                throw new Error('Invalid container type');
            }
            continue;
        }
        if (typeSchema.schemaProp.type === 'object' || typeSchema.schemaProp.type === 'array') {
            continue;
        }
        if (message.length <= index) {
            result[typeSchema.propertyName] = default_value_1.getDefaultValue(typeSchema.schemaProp.dataType);
            continue;
        }
        const [key, keySize] = varint_1.readUInt32(message, index);
        const [fieldNumber] = keys_1.readKey(key);
        if (fieldNumber !== typeSchema.schemaProp.fieldNumber) {
            result[typeSchema.propertyName] = default_value_1.getDefaultValue(typeSchema.schemaProp.dataType);
            continue;
        }
        index += keySize;
        const [scalarValue, scalarSize] = _readers[typeSchema.schemaProp.dataType](message, index);
        index += scalarSize;
        result[typeSchema.propertyName] = scalarValue;
    }
    return [result, index];
};
exports.readObject = readObject;
const readArray = (message, offset, compiledSchema, terminateIndex) => {
    let index = offset;
    if (index >= message.length) {
        return [[], index];
    }
    const startingByte = message[index];
    const [rootSchema, typeSchema] = compiledSchema;
    const [key] = varint_1.readUInt32(message, index);
    const [fieldNumber] = keys_1.readKey(key);
    if (fieldNumber !== rootSchema.schemaProp.fieldNumber) {
        return [[], index];
    }
    const result = [];
    if (Array.isArray(typeSchema)) {
        const [nestedTypeSchema] = typeSchema;
        if (nestedTypeSchema.schemaProp.type === 'object') {
            while (message[index] === startingByte && index !== terminateIndex) {
                const [, wire2KeySize] = varint_1.readUInt32(message, index);
                index += wire2KeySize;
                const [objectSize, objectSizeLength] = varint_1.readUInt32(message, index);
                index += objectSizeLength;
                if (objectSize === 0) {
                    continue;
                }
                const terminatingObjectSize = index + objectSize;
                const [res, nextOffset] = exports.readObject(message, index, typeSchema, terminatingObjectSize);
                result.push(res);
                index = nextOffset;
            }
            return [result, index];
        }
        throw new Error('Invalid container type');
    }
    if (typeSchema.schemaProp.dataType === 'string' || typeSchema.schemaProp.dataType === 'bytes') {
        while (message[index] === startingByte && index !== terminateIndex) {
            const [, wire2KeySize] = varint_1.readUInt32(message, index);
            index += wire2KeySize;
            const [wireType2Length, wireType2LengthSize] = varint_1.readUInt32(message, index);
            if (wireType2Length === 0) {
                if (typeSchema.schemaProp.dataType === 'string') {
                    result.push('');
                }
                else {
                    result.push(Buffer.alloc(0));
                }
                index += wireType2LengthSize;
                continue;
            }
            const [res, wire2Size] = _readers[typeSchema.schemaProp.dataType](message, index);
            result.push(res);
            index += wire2Size;
        }
        return [result, index];
    }
    const [, keySize] = varint_1.readUInt32(message, index);
    index += keySize;
    const [arrayLength, wireType2Size] = varint_1.readUInt32(message, index);
    index += wireType2Size;
    const end = index + arrayLength;
    while (index < end) {
        const [res, size] = _readers[typeSchema.schemaProp.dataType](message, index);
        result.push(res);
        index += size;
    }
    return [result, index];
};
exports.readArray = readArray;
const writeArray = (compiledSchema, message, chunks) => {
    if (message.length === 0) {
        return [chunks, 0];
    }
    let totalSize = 0;
    const [rootSchema, typeSchema] = compiledSchema;
    if (Array.isArray(typeSchema)) {
        for (let i = 0; i < message.length; i += 1) {
            const [res, objectSize] = exports.writeObject(typeSchema, message[i], []);
            chunks.push(rootSchema.binaryKey);
            const size = _writers.uint32(objectSize);
            chunks.push(size);
            for (let j = 0; j < res.length; j += 1) {
                chunks.push(res[j]);
            }
            totalSize += objectSize + size.length + rootSchema.binaryKey.length;
        }
        return [chunks, totalSize];
    }
    if (typeSchema.schemaProp.dataType === 'string' || typeSchema.schemaProp.dataType === 'bytes') {
        for (let i = 0; i < message.length; i += 1) {
            const res = _writers[typeSchema.schemaProp.dataType](message[i]);
            chunks.push(rootSchema.binaryKey);
            chunks.push(res);
            totalSize += res.length + rootSchema.binaryKey.length;
        }
        return [chunks, totalSize];
    }
    chunks.push(rootSchema.binaryKey);
    const contents = [];
    let contentSize = 0;
    for (let i = 0; i < message.length; i += 1) {
        const res = _writers[typeSchema.schemaProp.dataType](message[i]);
        contents.push(res);
        contentSize += res.length;
    }
    const arrayLength = _writers.uint32(contentSize);
    chunks.push(arrayLength);
    for (let i = 0; i < contents.length; i += 1) {
        chunks.push(contents[i]);
    }
    totalSize += rootSchema.binaryKey.length + contentSize + arrayLength.length;
    return [chunks, totalSize];
};
exports.writeArray = writeArray;
//# sourceMappingURL=collection.js.map