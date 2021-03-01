"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = {
    type: 'object',
    properties: {
        dataPath: {
            type: 'string',
            format: 'path',
            example: '~/.lisk/forger',
            description: 'The data path for storing forging related information captured from application.',
        },
    },
    required: ['dataPath'],
    default: {},
};
//# sourceMappingURL=default_config.js.map