/// <reference types="node" />
import { Chain } from '@liskhq/lisk-chain';
import { BFT } from '@liskhq/lisk-bft';
import { dataStructures } from '@liskhq/lisk-utils';
import { TransactionPool } from '@liskhq/lisk-transaction-pool';
import { KVStore } from '@liskhq/lisk-db';
import { HighFeeForgingStrategy } from './strategies';
import { Processor } from '../processor';
import { Logger } from '../../logger';
import { ForgingStatus } from '../../types';
interface Keypair {
    publicKey: Buffer;
    privateKey: Buffer;
}
export interface RegisteredDelegate {
    readonly address: Buffer;
    readonly encryptedPassphrase: string;
    readonly hashOnion: {
        readonly count: number;
        readonly distance: number;
        readonly hashes: Buffer[];
    };
}
interface ForgerConstructor {
    readonly forgingStrategy?: HighFeeForgingStrategy;
    readonly logger: Logger;
    readonly db: KVStore;
    readonly processorModule: Processor;
    readonly bftModule: BFT;
    readonly transactionPoolModule: TransactionPool;
    readonly chainModule: Chain;
    readonly forgingDelegates?: ReadonlyArray<RegisteredDelegate>;
    readonly forgingForce?: boolean;
    readonly forgingDefaultPassword?: string;
    readonly forgingWaitThreshold: number;
}
export declare class Forger {
    private readonly _logger;
    private readonly _db;
    private readonly _processorModule;
    private readonly _bftModule;
    private readonly _transactionPoolModule;
    private readonly _chainModule;
    private readonly _keypairs;
    private readonly _config;
    private readonly _forgingStrategy;
    constructor({ forgingStrategy, logger, db, processorModule, bftModule, transactionPoolModule, chainModule, forgingDelegates, forgingForce, forgingDefaultPassword, forgingWaitThreshold, }: ForgerConstructor);
    delegatesEnabled(): boolean;
    updateForgingStatus(forgerAddress: Buffer, password: string, forging: boolean, height: number, maxHeightPreviouslyForged: number, maxHeightPrevoted: number, overwrite?: boolean): Promise<ForgingStatus>;
    loadDelegates(): Promise<void>;
    forge(): Promise<void>;
    getForgersKeyPairs(): dataStructures.BufferMap<Keypair>;
    getForgingStatusOfAllDelegates(): Promise<ForgingStatus[] | undefined>;
    private _getNextHashOnion;
    private _getHashOnionConfig;
    private _filterUsedHashOnions;
    private _create;
}
export {};
