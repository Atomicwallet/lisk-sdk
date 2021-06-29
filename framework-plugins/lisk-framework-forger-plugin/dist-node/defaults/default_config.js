"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    type: 'object',
    properties: {
        dataPath: {
            type: 'string',
            format: 'path',
            examples: ['~/.lisk/forger'],
            description: 'The data path for storing forging related information captured from application.',
        },
    },
    required: [],
    default: {},
};
//# sourceMappingURL=default_config.js.map