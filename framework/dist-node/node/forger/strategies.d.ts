import { TransactionPool } from '@liskhq/lisk-transaction-pool';
import { Chain, Transaction } from '@liskhq/lisk-chain';
import { Processor } from '../processor';
export declare class HighFeeForgingStrategy {
    private readonly _chainModule;
    private readonly _processorModule;
    private readonly _transactionPoolModule;
    private readonly _constants;
    constructor({ chainModule, processorModule, transactionPoolModule, maxPayloadLength, }: {
        readonly chainModule: Chain;
        readonly processorModule: Processor;
        readonly transactionPoolModule: TransactionPool;
        readonly maxPayloadLength: number;
    });
    getTransactionsForBlock(): Promise<Transaction[]>;
}
