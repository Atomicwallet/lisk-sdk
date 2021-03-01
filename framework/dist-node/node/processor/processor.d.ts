/// <reference types="node" />
import { BFT } from '@liskhq/lisk-bft';
import { Chain, Block, GenesisBlock, StateStore, Transaction } from '@liskhq/lisk-chain';
import { EventEmitter } from 'events';
import { Logger } from '../../logger';
import { InMemoryChannel } from '../../controller/channels';
import { BaseModule } from '../../modules';
export declare const EVENT_PROCESSOR_SYNC_REQUIRED = "EVENT_PROCESSOR_SYNC_REQUIRED";
export declare const EVENT_PROCESSOR_BROADCAST_BLOCK = "EVENT_PROCESSOR_BROADCAST_BLOCK";
interface ProcessorInput {
    readonly channel: InMemoryChannel;
    readonly logger: Logger;
    readonly chainModule: Chain;
    readonly bftModule: BFT;
}
export declare class Processor {
    readonly events: EventEmitter;
    private readonly _channel;
    private readonly _logger;
    private readonly _chain;
    private readonly _bft;
    private readonly _mutex;
    private readonly _modules;
    private _stop;
    constructor({ channel, logger, chainModule, bftModule }: ProcessorInput);
    register(customModule: BaseModule): void;
    init(genesisBlock: GenesisBlock): Promise<void>;
    stop(): Promise<void>;
    process(block: Block, { peerId }?: {
        peerId?: string;
    }): Promise<void>;
    validate(block: Block): void;
    processValidated(block: Block, { removeFromTempTable }?: {
        removeFromTempTable?: boolean;
    }): Promise<void>;
    deleteLastBlock({ saveTempBlock, }?: {
        saveTempBlock?: boolean;
    }): Promise<void>;
    validateTransaction(transaction: Transaction): void;
    verifyTransactions(transactions: Transaction[], stateStore: StateStore): Promise<void>;
    private _processValidated;
    private _validate;
    private _deleteBlock;
    private _createConsensus;
    private _createScopedStateStore;
    private _createReducerHandler;
    private _getModuleByName;
    private _getModule;
    private _getAsset;
}
export {};
