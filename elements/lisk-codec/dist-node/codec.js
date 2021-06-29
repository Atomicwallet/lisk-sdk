"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codec = exports.Codec = exports.validateSchema = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const utils_1 = require("./utils");
const collection_1 = require("./collection");
const json_wrapper_1 = require("./json_wrapper");
const validateSchema = (schema) => {
    var _a;
    lisk_validator_1.validator.removeSchema(schema.$id);
    const schemaToValidate = {
        ...schema,
        $schema: (_a = schema.$schema) !== null && _a !== void 0 ? _a : lisk_validator_1.liskSchemaIdentifier,
    };
    const errors = lisk_validator_1.validator.validateSchema(schemaToValidate);
    if (errors.length) {
        throw new lisk_validator_1.LiskValidationError([...errors]);
    }
    try {
        lisk_validator_1.validator.compile(schemaToValidate);
    }
    finally {
        lisk_validator_1.validator.removeSchema(schema.$id);
    }
    return true;
};
exports.validateSchema = validateSchema;
class Codec {
    constructor() {
        this._compileSchemas = {};
    }
    addSchema(schema) {
        exports.validateSchema(schema);
        const schemaName = schema.$id;
        this._compileSchemas[schemaName] = this._compileSchema(schema, [], []);
        return true;
    }
    encode(schema, message) {
        if (this._compileSchemas[schema.$id] === undefined) {
            this.addSchema(schema);
        }
        const compiledSchema = this._compileSchemas[schema.$id];
        const res = collection_1.writeObject(compiledSchema, message, []);
        return Buffer.concat(res[0]);
    }
    decode(schema, message) {
        if (this._compileSchemas[schema.$id] === undefined) {
            this.addSchema(schema);
        }
        const compiledSchema = this._compileSchemas[schema.$id];
        const [res] = collection_1.readObject(message, 0, compiledSchema, message.length);
        return res;
    }
    decodeJSON(schema, message) {
        const decodedMessage = this.decode(schema, message);
        const jsonMessageAsObject = this.toJSON(schema, decodedMessage);
        return jsonMessageAsObject;
    }
    encodeJSON(schema, message) {
        const objectFromJson = this.fromJSON(schema, message);
        return this.encode(schema, objectFromJson);
    }
    toJSON(schema, message) {
        const messageCopy = lisk_utils_1.objects.cloneDeep(message);
        messageCopy[Symbol.iterator] = json_wrapper_1.iterator;
        json_wrapper_1.recursiveTypeCast('toJSON', messageCopy, schema, []);
        return messageCopy;
    }
    fromJSON(schema, message) {
        const messageCopy = lisk_utils_1.objects.cloneDeep(message);
        messageCopy[Symbol.iterator] = json_wrapper_1.iterator;
        json_wrapper_1.recursiveTypeCast('fromJSON', messageCopy, schema, []);
        return messageCopy;
    }
    clearCache() {
        this._compileSchemas = {};
    }
    _compileSchema(schema, compiledSchema, dataPath) {
        if (schema.type === 'object') {
            const { properties } = schema;
            if (properties === undefined) {
                throw new Error('Invalid schema. Missing "properties" property');
            }
            for (const property of Object.values(properties)) {
                if (!('fieldNumber' in property)) {
                    throw new Error('Invalid schema. Missing "fieldNumber" in properties');
                }
            }
            const currentDepthSchema = Object.entries(properties).sort((a, b) => a[1].fieldNumber - b[1].fieldNumber);
            for (let i = 0; i < currentDepthSchema.length; i += 1) {
                const [schemaPropertyName, schemaPropertyValue] = currentDepthSchema[i];
                if (schemaPropertyValue.type === 'object') {
                    if (!('fieldNumber' in schemaPropertyValue)) {
                        throw new Error('Invalid schema. Missing "fieldNumber" in properties');
                    }
                    dataPath.push(schemaPropertyName);
                    const nestedSchema = [
                        {
                            propertyName: schemaPropertyName,
                            schemaProp: {
                                type: schemaPropertyValue.type,
                                fieldNumber: schemaPropertyValue.fieldNumber,
                            },
                            dataPath: [...dataPath],
                            binaryKey: utils_1.generateKey(schemaPropertyValue),
                        },
                    ];
                    const res = this._compileSchema(schemaPropertyValue, nestedSchema, dataPath);
                    compiledSchema.push(res);
                    dataPath.pop();
                }
                else if (schemaPropertyValue.type === 'array') {
                    if (schemaPropertyValue.items === undefined) {
                        throw new Error('Invalid schema. Missing "items" property for Array schema');
                    }
                    if (!('fieldNumber' in schemaPropertyValue)) {
                        throw new Error('Invalid schema. Missing "fieldNumber" in properties');
                    }
                    dataPath.push(schemaPropertyName);
                    if (schemaPropertyValue.items.type === 'object') {
                        const nestedSchema = [
                            {
                                propertyName: schemaPropertyName,
                                schemaProp: {
                                    type: 'object',
                                    fieldNumber: schemaPropertyValue.fieldNumber,
                                },
                                dataPath: [...dataPath],
                                binaryKey: utils_1.generateKey(schemaPropertyValue),
                            },
                        ];
                        const res = this._compileSchema(schemaPropertyValue.items, nestedSchema, dataPath);
                        compiledSchema.push([
                            {
                                propertyName: schemaPropertyName,
                                schemaProp: {
                                    type: schemaPropertyValue.type,
                                    fieldNumber: schemaPropertyValue.fieldNumber,
                                },
                                dataPath: [...dataPath],
                                binaryKey: utils_1.generateKey(schemaPropertyValue),
                            },
                            res,
                        ]);
                        dataPath.pop();
                    }
                    else {
                        compiledSchema.push([
                            {
                                propertyName: schemaPropertyName,
                                schemaProp: {
                                    type: schemaPropertyValue.type,
                                    fieldNumber: schemaPropertyValue.fieldNumber,
                                },
                                dataPath: [...dataPath],
                                binaryKey: utils_1.generateKey(schemaPropertyValue),
                            },
                            {
                                propertyName: schemaPropertyName,
                                schemaProp: {
                                    dataType: schemaPropertyValue.items.dataType,
                                    fieldNumber: schemaPropertyValue.fieldNumber,
                                },
                                dataPath: [...dataPath],
                                binaryKey: utils_1.generateKey(schemaPropertyValue),
                            },
                        ]);
                        dataPath.pop();
                    }
                }
                else {
                    compiledSchema.push({
                        propertyName: schemaPropertyName,
                        schemaProp: schemaPropertyValue,
                        dataPath: [...dataPath],
                        binaryKey: utils_1.generateKey(schemaPropertyValue),
                    });
                }
            }
        }
        return compiledSchema;
    }
}
exports.Codec = Codec;
exports.codec = new Codec();
//# sourceMappingURL=codec.js.map