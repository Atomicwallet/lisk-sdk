/// <reference types="node" />
import { EventEmitter } from 'events';
import { BlockHeader, Chain, StateStore } from '@liskhq/lisk-chain';
import { FinalityManager } from './finality_manager';
import { ForkStatus } from './types';
export declare const EVENT_BFT_BLOCK_FINALIZED = "EVENT_BFT_BLOCK_FINALIZED";
export declare const BFTFinalizedHeightCodecSchema: {
    type: string;
    $id: string;
    title: string;
    properties: {
        finalizedHeight: {
            dataType: string;
            fieldNumber: number;
        };
    };
    required: string[];
};
export declare class BFT extends EventEmitter {
    readonly constants: {
        threshold: number;
        genesisHeight: number;
    };
    private _finalityManager?;
    private readonly _chain;
    constructor({ chain, threshold, genesisHeight, }: {
        readonly chain: Chain;
        readonly threshold: number;
        readonly genesisHeight: number;
    });
    init(stateStore: StateStore): Promise<void>;
    get finalityManager(): FinalityManager;
    applyBlockHeader(block: BlockHeader, stateStore: StateStore): Promise<void>;
    verifyBlockHeader(blockHeader: BlockHeader, stateStore: StateStore): Promise<void>;
    forkChoice(blockHeader: BlockHeader, lastBlockHeader: BlockHeader): ForkStatus;
    isBFTProtocolCompliant(blockHeader: BlockHeader, stateStore: StateStore): Promise<boolean>;
    getMaxHeightPrevoted(): Promise<number>;
    get finalizedHeight(): number;
    private _initFinalityManager;
}
