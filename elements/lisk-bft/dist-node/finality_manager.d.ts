/// <reference types="node" />
import { BlockHeader, Chain, StateStore } from '@liskhq/lisk-chain';
import { EventEmitter } from 'events';
export declare const EVENT_BFT_FINALIZED_HEIGHT_CHANGED = "EVENT_BFT_FINALIZED_HEIGHT_CHANGED";
export declare const CONSENSUS_STATE_VALIDATOR_LEDGER_KEY = "bft:votingLedger";
export declare const BFTVotingLedgerSchema: {
    type: string;
    $id: string;
    title: string;
    required: string[];
    properties: {
        validators: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                required: string[];
                properties: {
                    address: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    maxPreVoteHeight: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    maxPreCommitHeight: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
        ledger: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                required: string[];
                properties: {
                    height: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    prevotes: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    precommits: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
    };
};
interface ValidatorsState {
    address: Buffer;
    maxPreVoteHeight: number;
    maxPreCommitHeight: number;
}
interface LedgerState {
    height: number;
    prevotes: number;
    precommits: number;
}
export interface VotingLedger {
    readonly validators: ValidatorsState[];
    readonly ledger: LedgerState[];
}
export declare class FinalityManager extends EventEmitter {
    readonly preVoteThreshold: number;
    readonly preCommitThreshold: number;
    readonly processingThreshold: number;
    readonly maxHeaders: number;
    finalizedHeight: number;
    private readonly _chain;
    constructor({ chain, finalizedHeight, threshold, }: {
        readonly chain: Chain;
        readonly finalizedHeight: number;
        readonly threshold: number;
    });
    addBlockHeader(blockHeader: BlockHeader, stateStore: StateStore): Promise<FinalityManager>;
    updatePrevotesPrecommits(header: BlockHeader, stateStore: StateStore, bftBlockHeaders: ReadonlyArray<BlockHeader>): Promise<boolean>;
    updateFinalizedHeight(stateStore: StateStore): Promise<boolean>;
    verifyBlockHeaders(blockHeader: BlockHeader, stateStore: StateStore): Promise<boolean>;
    getMaxHeightPrevoted(): Promise<number>;
    private _calculateMaxHeightPrevoted;
    private _getMinValidHeightToPreCommit;
    private _getVotingLedger;
    private _decodeVotingLedger;
    private _setVotingLedger;
}
export {};
