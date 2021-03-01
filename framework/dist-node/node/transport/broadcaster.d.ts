/// <reference types="node" />
import { TransactionPool } from '@liskhq/lisk-transaction-pool';
import { Logger } from '../../logger';
import { Network } from '../network';
interface BroadcasterConfig {
    readonly releaseLimit: number;
    readonly interval: number;
}
export interface BroadcasterConstructor extends BroadcasterConfig {
    readonly transactionPool: TransactionPool;
    readonly logger: Logger;
    readonly networkModule: Network;
}
export declare class Broadcaster {
    private readonly _logger;
    private readonly _transactionPool;
    private readonly _networkModule;
    private readonly _config;
    private _transactionIdQueue;
    constructor({ transactionPool, releaseLimit, interval, logger, networkModule, }: BroadcasterConstructor);
    enqueueTransactionId(transactionId: Buffer): boolean;
    private _broadcast;
}
export {};
