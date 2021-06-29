"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForkStats = void 0;
const getForkStats = (state) => ({
    forkEventCount: state.forks.forkEventCount,
    blockHeaders: state.forks.blockHeaders,
});
exports.getForkStats = getForkStats;
//# sourceMappingURL=forks.js.map