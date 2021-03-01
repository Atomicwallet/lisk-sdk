import { BaseChannel } from 'lisk-framework';
import { SharedState, TransactionPropagationStats } from '../types';
interface TransactionStats {
    transactions: Record<string, TransactionPropagationStats>;
    connectedPeers: number;
    averageReceivedTransactions: number;
}
export declare const getTransactionStats: (channel: BaseChannel, state: SharedState) => Promise<TransactionStats>;
export {};
