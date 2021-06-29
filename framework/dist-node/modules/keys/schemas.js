"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keysSchema = void 0;
exports.keysSchema = {
    $id: 'lisk/keys/register',
    type: 'object',
    required: ['numberOfSignatures', 'optionalKeys', 'mandatoryKeys'],
    properties: {
        numberOfSignatures: {
            dataType: 'uint32',
            fieldNumber: 1,
            minimum: 1,
            maximum: 64,
        },
        mandatoryKeys: {
            type: 'array',
            items: {
                dataType: 'bytes',
                minLength: 32,
                maxLength: 32,
            },
            fieldNumber: 2,
            minItems: 0,
            maxItems: 64,
        },
        optionalKeys: {
            type: 'array',
            items: {
                dataType: 'bytes',
                minLength: 32,
                maxLength: 32,
            },
            fieldNumber: 3,
            minItems: 0,
            maxItems: 64,
        },
    },
};
//# sourceMappingURL=schemas.js.map