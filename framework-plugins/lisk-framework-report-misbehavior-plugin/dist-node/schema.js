"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postBlockEventSchema = void 0;
exports.postBlockEventSchema = {
    $id: 'report-misbehavior/postBlockEvent',
    type: 'object',
    required: ['block'],
    properties: {
        block: {
            type: 'string',
            format: 'hex',
        },
    },
};
//# sourceMappingURL=schema.js.map