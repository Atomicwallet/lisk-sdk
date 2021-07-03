import { BaseTransaction, MultisignatureStatus, StateStore, StateStorePrepare } from './base_transaction';
import { SignatureObject } from './create_signature_object';
import { TransactionError } from './errors';
import { TransactionResponse } from './response';
import { TransactionJSON } from './transaction_types';
export declare const multisignatureAssetFormatSchema: {
    type: string;
    required: string[];
    properties: {
        multisignature: {
            type: string;
            required: string[];
            properties: {
                min: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                lifetime: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                keysgroup: {
                    type: string;
                    uniqueItems: boolean;
                    minItems: number;
                    maxItems: number;
                    items: {
                        type: string;
                        format: string;
                    };
                };
            };
        };
    };
};
export interface MultiSignatureAsset {
    readonly multisignature: {
        readonly keysgroup: ReadonlyArray<string>;
        readonly lifetime: number;
        readonly min: number;
    };
}
export declare class MultisignatureTransaction extends BaseTransaction {
    readonly asset: MultiSignatureAsset;
    protected _multisignatureStatus: MultisignatureStatus;
    constructor(rawTransaction: unknown);
    protected assetToBytes(): Buffer;
    assetToJSON(): MultiSignatureAsset;
    prepare(store: StateStorePrepare): Promise<void>;
    protected verifyAgainstTransactions(transactions: ReadonlyArray<TransactionJSON>): ReadonlyArray<TransactionError>;
    protected validateAsset(): ReadonlyArray<TransactionError>;
    processMultisignatures(_: StateStore): TransactionResponse;
    protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
    protected undoAsset(store: StateStore): ReadonlyArray<TransactionError>;
    addMultisignature(store: StateStore, signatureObject: SignatureObject): TransactionResponse;
    protected assetFromSync(raw: any): object | undefined;
}
