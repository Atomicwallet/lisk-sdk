/// <reference types="node" />
import { AccountSchema, Account, GenesisBlockHeader, GenesisBlock, AccountDefaultProps } from '@liskhq/lisk-chain';
export declare type PartialReq<T, Keys extends keyof T = keyof T> = Pick<Partial<T>, Exclude<keyof T, Keys>> & {
    [K in Keys]: T[K];
};
export declare type GenesisBlockHeaderWithoutId<T> = Omit<GenesisBlockHeader<T>, 'id'>;
export declare type accountAssetSchemas = {
    [moduleName: string]: AccountSchema;
};
export interface GenesisBlockJSONParams {
    readonly genesisBlock: GenesisBlock;
    readonly accountAssetSchemas: accountAssetSchemas;
}
export interface GenesisBlockParams<T = AccountDefaultProps> {
    readonly accounts: ReadonlyArray<Partial<Account<T>> & {
        address: Buffer;
    }>;
    readonly initDelegates: ReadonlyArray<Buffer>;
    readonly accountAssetSchemas: accountAssetSchemas;
    readonly initRounds?: number;
    readonly height?: number;
    readonly timestamp?: number;
    readonly previousBlockID?: Buffer;
}
