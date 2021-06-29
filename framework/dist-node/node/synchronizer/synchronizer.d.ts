import { BFT } from '@liskhq/lisk-bft';
import { Chain, Block } from '@liskhq/lisk-chain';
import { TransactionPool } from '@liskhq/lisk-transaction-pool';
import { BaseSynchronizer } from './base_synchronizer';
import { InMemoryChannel } from '../../controller/channels';
import { Logger } from '../../logger';
import { Network } from '../network';
import { Processor } from '../processor';
interface SynchronizerInput {
    readonly logger: Logger;
    readonly channel: InMemoryChannel;
    readonly chainModule: Chain;
    readonly bftModule: BFT;
    readonly processorModule: Processor;
    readonly transactionPoolModule: TransactionPool;
    readonly mechanisms: BaseSynchronizer[];
    readonly networkModule: Network;
}
export declare class Synchronizer {
    protected logger: Logger;
    protected channel: InMemoryChannel;
    private readonly chainModule;
    private readonly bftModule;
    private readonly _mutex;
    private readonly processorModule;
    private readonly transactionPoolModule;
    private readonly _networkModule;
    private readonly mechanisms;
    private readonly loadTransactionsRetries;
    constructor({ channel, logger, chainModule, bftModule, processorModule, transactionPoolModule, mechanisms, networkModule, }: SynchronizerInput);
    init(): Promise<void>;
    run(receivedBlock: Block, peerId: string): Promise<void>;
    get isActive(): boolean;
    stop(): Promise<void>;
    loadUnconfirmedTransactions(): Promise<void>;
    private _determineSyncMechanism;
    private _getUnconfirmedTransactionsFromNetwork;
    private _checkMechanismsInterfaces;
}
export {};
