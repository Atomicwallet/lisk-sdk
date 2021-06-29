"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataTypeKeyword = exports.metaSchema = void 0;
const createDebug = require("debug");
const errors_1 = require("../errors");
const validation_1 = require("../validation");
const debug = createDebug('codec:keyword:dataType');
exports.metaSchema = {
    title: 'Lisk Codec Data Type',
    type: 'string',
    enum: ['bytes', 'uint32', 'sint32', 'uint64', 'sint64', 'string', 'boolean'],
};
const compile = (value, parentSchema, it) => {
    var _a;
    debug('compile: value: %s', value);
    debug('compile: parent schema: %j', parentSchema);
    const typePropertyPresent = Object.keys(parentSchema).includes('type');
    if (typePropertyPresent) {
        throw new errors_1.LiskValidationError([
            {
                keyword: 'dataType',
                message: 'Either "dataType" or "type" can be presented in schema',
                params: { dataType: value },
                dataPath: '',
                schemaPath: (_a = it.schemaPath.str) !== null && _a !== void 0 ? _a : '',
            },
        ]);
    }
    const validate = (data, _dataCxt) => {
        if (value === 'boolean') {
            return validation_1.isBoolean(data);
        }
        if (value === 'bytes') {
            if (!validation_1.isBytes(data)) {
                return false;
            }
            const parent = parentSchema;
            if (typeof parent.minLength === 'number') {
                const { length } = data;
                if (length < parent.minLength) {
                    validate.errors = [
                        {
                            keyword: 'dataType',
                            message: 'minLength not satisfied',
                            params: { dataType: value, minLength: parent.minLength, length },
                        },
                    ];
                    return false;
                }
            }
            if (typeof parent.maxLength === 'number') {
                const { length } = data;
                if (length > parent.maxLength) {
                    validate.errors = [
                        {
                            keyword: 'dataType',
                            message: 'maxLength exceeded',
                            params: { dataType: value, maxLength: parent.maxLength, length },
                        },
                    ];
                    return false;
                }
            }
        }
        if (value === 'string') {
            return validation_1.isString(data);
        }
        if (value === 'uint32') {
            return validation_1.isUInt32(data);
        }
        if (value === 'uint64') {
            return validation_1.isUInt64(data);
        }
        if (value === 'sint32') {
            return validation_1.isSInt32(data);
        }
        if (value === 'sint64') {
            return validation_1.isSInt64(data);
        }
        return true;
    };
    return validate;
};
exports.dataTypeKeyword = {
    keyword: 'dataType',
    compile,
    errors: 'full',
    modifying: false,
    metaSchema: exports.metaSchema,
};
//# sourceMappingURL=data_type.js.map