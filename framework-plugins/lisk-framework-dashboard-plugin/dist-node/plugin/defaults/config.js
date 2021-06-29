"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    $id: '#/plugins/lisk-dashboard/config',
    type: 'object',
    properties: {
        applicationName: {
            type: 'string',
            description: 'Application name to be shown near Logo',
        },
        applicationUrl: {
            type: 'string',
            format: 'uri',
            description: 'URL to connect',
        },
        port: {
            type: 'integer',
            minimum: 1,
            maximum: 65535,
        },
        host: {
            type: 'string',
            format: 'ip',
        },
    },
    required: [],
    default: {
        applicationUrl: 'ws://localhost:8080/ws',
        port: 4005,
        host: '127.0.0.1',
        applicationName: 'Lisk',
    },
};
//# sourceMappingURL=config.js.map