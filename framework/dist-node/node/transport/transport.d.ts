import { Chain, Block, Transaction } from '@liskhq/lisk-chain';
import { TransactionPool } from '@liskhq/lisk-transaction-pool';
import { Synchronizer } from '../synchronizer';
import { Processor } from '../processor';
import { Logger } from '../../logger';
import { EventPostTransactionData } from '../../types';
import { InMemoryChannel } from '../../controller/channels';
import { Network } from '../network';
export interface TransportConstructor {
    readonly channel: InMemoryChannel;
    readonly logger: Logger;
    readonly synchronizer: Synchronizer;
    readonly transactionPoolModule: TransactionPool;
    readonly chainModule: Chain;
    readonly processorModule: Processor;
    readonly networkModule: Network;
}
export interface handlePostTransactionReturn {
    transactionId: string;
}
interface HandleRPCGetTransactionsReturn {
    transactions: string[];
}
export declare class Transport {
    private _rateTracker;
    private readonly _channel;
    private readonly _logger;
    private readonly _synchronizerModule;
    private readonly _transactionPoolModule;
    private readonly _chainModule;
    private readonly _processorModule;
    private readonly _broadcaster;
    private readonly _networkModule;
    constructor({ channel, logger, synchronizer, transactionPoolModule, chainModule, processorModule, networkModule, }: TransportConstructor);
    handleBroadcastTransaction(transaction: Transaction): void;
    handleBroadcastBlock(block: Block): Promise<unknown>;
    handleRPCGetLastBlock(peerId: string): string;
    handleRPCGetBlocksFromId(data: unknown, peerId: string): Promise<string[]>;
    handleRPCGetHighestCommonBlock(data: unknown, peerId: string): Promise<string | undefined>;
    handleEventPostBlock(data: unknown, peerId: string): Promise<void>;
    handleRPCGetTransactions(data: unknown, peerId: string): Promise<HandleRPCGetTransactionsReturn>;
    handleEventPostTransaction(data: EventPostTransactionData): Promise<handlePostTransactionReturn>;
    handleEventPostTransactionsAnnouncement(data: unknown, peerId: string): Promise<null>;
    private _obtainUnknownTransactionIDs;
    private _receiveTransaction;
    private _addRateLimit;
}
export {};
