"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    type: 'object',
    properties: {
        cleanupFrequency: {
            type: 'integer',
            description: 'Frequency of cleaning up the outdated data in second.',
        },
        encryptedPassphrase: {
            type: 'string',
            format: 'encryptedPassphrase',
        },
        defaultPassword: {
            type: 'string',
        },
        dataPath: {
            type: 'string',
            format: 'path',
            examples: ['~/.lisk/report-misbehavior'],
            description: 'The data path for storing misbehavior related information captured from application.',
        },
        fee: {
            type: 'integer',
            description: 'The fee required to report misbehavior transaction.',
        },
    },
    required: [],
    default: {
        cleanupFrequency: 3600,
        encryptedPassphrase: '',
        defaultPassword: '',
        fee: 100000000,
    },
};
//# sourceMappingURL=default_config.js.map