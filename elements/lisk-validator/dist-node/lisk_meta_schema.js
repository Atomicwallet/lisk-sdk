"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liskMetaSchema = void 0;
exports.liskMetaSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'http://lisk.io/lisk-schema/schema#',
    title: 'Lisk Schema',
    type: 'object',
    properties: {
        $schema: {
            type: 'string',
            const: 'http://lisk.io/lisk-schema/schema#',
            format: 'uri',
        },
        $id: {
            type: 'string',
            format: 'uri-reference',
        },
        title: {
            type: 'string',
        },
        type: {
            type: 'string',
            const: 'object',
        },
        properties: {
            type: 'object',
            propertyNames: {
                type: 'string',
                format: 'camelCase',
            },
            additionalProperties: {
                anyOf: [
                    {
                        $ref: '#/definitions/schema',
                    },
                    {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['array', 'object'],
                            },
                        },
                    },
                ],
            },
            minProperties: 1,
        },
        required: {
            type: 'array',
            items: {
                type: 'string',
            },
            uniqueItems: true,
        },
    },
    required: ['$id', '$schema', 'type', 'properties'],
    additionalProperties: false,
    definitions: {
        schema: {
            allOf: [{ $ref: 'http://json-schema.org/draft-07/schema#' }],
        },
    },
};
//# sourceMappingURL=lisk_meta_schema.js.map