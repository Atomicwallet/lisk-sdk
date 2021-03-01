/// <reference types="node" />
import { BlockHeader, Account, AccountDefaultProps } from '../../types';
interface AccountState {
    get(address: Buffer): Promise<Account<any>>;
    getOrDefault(address: Buffer): Promise<Account<any>>;
    set(address: Buffer, account: any): void;
    del(address: Buffer): Promise<void>;
    getUpdated(): Account[];
}
interface ChainState {
    lastBlockHeaders: BlockHeader[];
    lastBlockReward: bigint;
    networkIdentifier: Buffer;
    get(key: string): Promise<Buffer | undefined>;
    set(address: string, value: Buffer): void;
}
interface ConsensusState {
    get(key: string): Promise<Buffer | undefined>;
    set(address: string, value: Buffer): void;
}
export interface MockInput {
    accounts?: Account<any>[];
    defaultAccount?: AccountDefaultProps;
    chain?: {
        [key: string]: Buffer;
    };
    consensus?: {
        [key: string]: Buffer;
    };
    lastBlockHeaders?: Partial<BlockHeader>[];
    networkIdentifier?: Buffer;
    lastBlockReward?: bigint;
}
export declare class StateStoreMock {
    accountData: {
        address: Buffer;
    }[];
    chainData: {
        [key: string]: Buffer;
    };
    consensusData: {
        [key: string]: Buffer;
    };
    account: AccountState;
    chain: ChainState;
    consensus: ConsensusState;
    private readonly _defaultAccount;
    constructor({ accounts, chain, consensus, defaultAccount, lastBlockHeaders, lastBlockReward, networkIdentifier, }?: MockInput);
}
export {};
