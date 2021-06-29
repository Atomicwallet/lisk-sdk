/// <reference types="node" />
import { BlockHeader, Account, AccountDefaultProps } from '../../types';
interface AccountState {
    get<T = any>(address: Buffer): Promise<Account<T>>;
    getOrDefault<T = any>(address: Buffer): Promise<Account<T>>;
    set<T = any>(address: Buffer, account: T): Promise<void>;
    del(address: Buffer): Promise<void>;
    getUpdated<T = any>(): Account<T>[];
}
interface ChainState {
    lastBlockHeaders: BlockHeader[];
    lastBlockReward: bigint;
    networkIdentifier: Buffer;
    get(key: string): Promise<Buffer | undefined>;
    set(address: string, value: Buffer): Promise<void>;
}
interface ConsensusState {
    get(key: string): Promise<Buffer | undefined>;
    set(address: string, value: Buffer): Promise<void>;
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
