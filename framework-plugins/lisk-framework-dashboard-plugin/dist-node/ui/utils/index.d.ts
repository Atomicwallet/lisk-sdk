import { apiClient } from '@liskhq/lisk-client';
import { Block, Transaction } from '../types';
interface Config {
    applicationUrl: string;
    applicationName: string;
}
export declare const updateStatesOnNewBlock: (client: apiClient.APIClient, newBlockStr: string, blocks: Block[], confirmedTransactions: Transaction[], unconfirmedTransactions: Transaction[]) => {
    blocks: Block[];
    confirmedTransactions: Transaction[];
    unconfirmedTransactions: Transaction[];
};
export declare const updateStatesOnNewTransaction: (client: apiClient.APIClient, newTransactionStr: string, unconfirmedTransactions: Transaction[]) => Transaction[];
export declare const getConfig: () => Promise<Config>;
export {};
