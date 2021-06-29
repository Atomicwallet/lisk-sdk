/// <reference types="node" />
import { Transaction } from '@liskhq/lisk-chain';
import { AssetClass } from './types';
interface CreateTransactionInput {
    moduleID: number;
    assetClass: AssetClass;
    asset: Record<string, unknown>;
    nonce?: bigint;
    fee?: bigint;
    passphrase?: string;
    networkIdentifier?: Buffer;
}
export declare const createTransaction: ({ moduleID, assetClass, asset, nonce, fee, passphrase, networkIdentifier, }: CreateTransactionInput) => Transaction;
export {};
