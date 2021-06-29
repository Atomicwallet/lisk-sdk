"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldNumberKeyword = exports.metaSchema = void 0;
const createDebug = require("debug");
const errors_1 = require("../errors");
const debug = createDebug('codec:keyword:fieldNumber');
exports.metaSchema = {
    title: 'Lisk Codec Field Number',
    type: 'number',
    minimum: 1,
    maximum: 18999,
};
const deepValue = (obj, path) => {
    const parts = path.split('.');
    const len = parts.length;
    let result = obj;
    for (let i = 0; i < len; i += 1) {
        result = result[parts[i]];
    }
    return result;
};
const compile = (value, parentSchema, it) => {
    debug('compile: schema: %i', value);
    debug('compile: parent schema: %j', parentSchema);
    const { schemaPath, schemaEnv: { root: { schema: rootSchema }, }, } = it;
    const parentPath = schemaPath.str.split('.');
    parentPath.shift();
    parentPath.pop();
    const parentSchemaObject = deepValue(rootSchema, parentPath.join('.'));
    const fieldNumbers = Object.keys(parentSchemaObject).map((key) => parentSchemaObject[key].fieldNumber);
    const uniqueFieldNumbers = [...new Set(fieldNumbers)];
    if (fieldNumbers.length !== uniqueFieldNumbers.length) {
        throw new errors_1.LiskValidationError([
            {
                keyword: 'fieldNumber',
                message: 'Value must be unique across all properties on same level',
                params: { fieldNumbers },
                dataPath: '',
                schemaPath: schemaPath.str,
            },
        ]);
    }
    return (_data, _dataCxt) => true;
};
exports.fieldNumberKeyword = {
    keyword: 'fieldNumber',
    compile,
    valid: true,
    errors: false,
    modifying: false,
    metaSchema: exports.metaSchema,
};
//# sourceMappingURL=field_number.js.map