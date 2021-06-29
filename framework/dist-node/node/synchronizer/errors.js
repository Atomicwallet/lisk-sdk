"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyPenaltyAndAbortError = exports.ApplyPenaltyAndRestartError = exports.AbortError = exports.RestartError = exports.BlockProcessingError = exports.SynchronizerError = void 0;
const errors_1 = require("../../errors");
class SynchronizerError extends errors_1.FrameworkError {
}
exports.SynchronizerError = SynchronizerError;
class BlockProcessingError extends SynchronizerError {
}
exports.BlockProcessingError = BlockProcessingError;
class RestartError extends SynchronizerError {
    constructor(reason) {
        super(`Restart synchronization mechanism with reason: ${reason}`);
        this.reason = reason;
    }
}
exports.RestartError = RestartError;
class AbortError extends SynchronizerError {
    constructor(reason) {
        super(`Abort synchronization mechanism with reason: ${reason}`);
        this.reason = reason;
    }
}
exports.AbortError = AbortError;
class ApplyPenaltyAndRestartError extends SynchronizerError {
    constructor(peerId, reason) {
        super(`Apply penalty and restart synchronization mechanism with reason: ${reason}`);
        this.reason = reason;
        this.peerId = peerId;
    }
}
exports.ApplyPenaltyAndRestartError = ApplyPenaltyAndRestartError;
class ApplyPenaltyAndAbortError extends SynchronizerError {
    constructor(peerId, reason) {
        super(`Apply penalty and abort synchronization mechanism with reason: ${reason}`);
        this.reason = reason;
        this.peerId = peerId;
    }
}
exports.ApplyPenaltyAndAbortError = ApplyPenaltyAndAbortError;
//# sourceMappingURL=errors.js.map