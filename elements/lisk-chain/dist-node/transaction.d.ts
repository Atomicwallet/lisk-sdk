/// <reference types="node" />
export interface TransactionInput {
    readonly moduleID: number;
    readonly assetID: number;
    readonly senderPublicKey: Buffer;
    readonly nonce: bigint;
    readonly fee: bigint;
    readonly asset: Buffer;
    readonly signatures: ReadonlyArray<Buffer>;
}
export declare const transactionSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        moduleID: {
            dataType: string;
            fieldNumber: number;
            minimum: number;
        };
        assetID: {
            dataType: string;
            fieldNumber: number;
        };
        nonce: {
            dataType: string;
            fieldNumber: number;
        };
        fee: {
            dataType: string;
            fieldNumber: number;
        };
        senderPublicKey: {
            dataType: string;
            fieldNumber: number;
            minLength: number;
            maxLength: number;
        };
        asset: {
            dataType: string;
            fieldNumber: number;
        };
        signatures: {
            type: string;
            items: {
                dataType: string;
            };
            fieldNumber: number;
        };
    };
};
export declare const calculateMinFee: (tx: Transaction, minFeePerByte: number, baseFees: {
    moduleID: number;
    assetID: number;
    baseFee: string;
}[]) => bigint;
export declare class Transaction {
    readonly moduleID: number;
    readonly assetID: number;
    readonly asset: Buffer;
    readonly nonce: bigint;
    readonly fee: bigint;
    readonly senderPublicKey: Buffer;
    readonly signatures: ReadonlyArray<Buffer>;
    private _id?;
    private _senderAddress?;
    constructor(transaction: TransactionInput);
    static decode(bytes: Buffer): Transaction;
    get id(): Buffer;
    get senderAddress(): Buffer;
    getBytes(): Buffer;
    getSigningBytes(): Buffer;
    validate(input: {
        minFeePerByte: number;
        baseFees: {
            moduleID: number;
            assetID: number;
            baseFee: string;
        }[];
    }): void;
}
