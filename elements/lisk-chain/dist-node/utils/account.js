"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountSchemaWithDefault = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
const schema_1 = require("../schema");
const getAccountSchemaWithDefault = (accountSchemas) => {
    const defaultAccount = {};
    const accountSchema = lisk_utils_1.objects.cloneDeep(schema_1.baseAccountSchema);
    for (const [name, schema] of Object.entries(accountSchemas)) {
        const { default: defaultValue, ...schemaWithoutDefault } = schema;
        accountSchema.properties[name] = schemaWithoutDefault;
        accountSchema.required.push(name);
        defaultAccount[name] = defaultValue;
    }
    return {
        ...accountSchema,
        default: defaultAccount,
    };
};
exports.getAccountSchemaWithDefault = getAccountSchemaWithDefault;
//# sourceMappingURL=account.js.map