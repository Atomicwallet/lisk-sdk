import { FrameworkError } from '../../errors';
export declare class SynchronizerError extends FrameworkError {
}
export declare class BlockProcessingError extends SynchronizerError {
}
export declare class RestartError extends SynchronizerError {
    reason: string;
    constructor(reason: string);
}
export declare class AbortError extends SynchronizerError {
    reason: string;
    constructor(reason: string);
}
export declare class ApplyPenaltyAndRestartError extends SynchronizerError {
    reason: string;
    peerId: string;
    constructor(peerId: string, reason: string);
}
export declare class ApplyPenaltyAndAbortError extends SynchronizerError {
    reason: string;
    peerId: string;
    constructor(peerId: string, reason: string);
}
