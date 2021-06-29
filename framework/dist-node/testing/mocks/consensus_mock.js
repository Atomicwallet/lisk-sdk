"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consensusMock = void 0;
exports.consensusMock = {
    getDelegates: async () => Promise.resolve([]),
    updateDelegates: async (_delegates) => Promise.resolve(),
    getFinalizedHeight: () => 0,
};
//# sourceMappingURL=consensus_mock.js.map