"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = exports.liskSchemaIdentifier = void 0;
const ajv_1 = require("ajv");
const ajv_formats_1 = require("ajv-formats");
const formats = require("./formats");
const errors_1 = require("./errors");
const field_number_1 = require("./keywords/field_number");
const data_type_1 = require("./keywords/data_type");
const lisk_meta_schema_1 = require("./lisk_meta_schema");
exports.liskSchemaIdentifier = lisk_meta_schema_1.liskMetaSchema.$id;
class LiskValidator {
    constructor() {
        this._validator = new ajv_1.default({
            strict: true,
            strictSchema: true,
            allErrors: true,
            useDefaults: false,
            addUsedSchema: false,
            strictTypes: false,
        });
        ajv_formats_1.default(this._validator);
        for (const formatName of Object.keys(formats)) {
            this._validator.addFormat(formatName, formats[formatName]);
        }
        this._validator.addKeyword({
            keyword: 'uniqueSignedPublicKeys',
            type: 'array',
            compile: () => (data) => new Set(data.filter(datum => typeof datum === 'string').map((key) => key.slice(1)))
                .size === data.length,
        });
        this._validator.compile(lisk_meta_schema_1.liskMetaSchema);
        this._validator.addMetaSchema(lisk_meta_schema_1.liskMetaSchema);
        this._validator.addKeyword(field_number_1.fieldNumberKeyword);
        this._validator.addKeyword(data_type_1.dataTypeKeyword);
    }
    validate(schema, data) {
        if (!this._validator.validate(schema, data)) {
            return errors_1.convertErrorsToLegacyFormat(this._validator.errors);
        }
        return [];
    }
    validateSchema(schema) {
        if (!this._validator.validateSchema(schema)) {
            return errors_1.convertErrorsToLegacyFormat(this._validator.errors);
        }
        return [];
    }
    compile(schema) {
        try {
            return this._validator.compile(schema);
        }
        catch (error) {
            if (error instanceof errors_1.LiskValidationError) {
                throw error;
            }
            throw new errors_1.LiskValidationError([
                {
                    message: error.message.toString(),
                    dataPath: '',
                    keyword: '',
                    schemaPath: '',
                    params: {},
                },
            ]);
        }
    }
    removeSchema(schemaKeyRef) {
        return this._validator.removeSchema(schemaKeyRef);
    }
}
exports.validator = new LiskValidator();
//# sourceMappingURL=lisk_validator.js.map