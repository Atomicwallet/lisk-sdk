/// <reference types="node" />
import { Channel, RegisteredSchemas, NodeInfo } from './types';
export declare class Transaction {
    private readonly _channel;
    private readonly _schema;
    private readonly _nodeInfo;
    constructor(channel: Channel, registeredSchema: RegisteredSchemas, nodeInfo: NodeInfo);
    create(input: {
        moduleID?: number;
        moduleName?: string;
        assetID?: number;
        assetName?: string;
        fee: bigint;
        nonce?: bigint;
        senderPublicKey?: Buffer;
        asset: Record<string, unknown>;
        signatures?: Buffer[];
    }, passphrase: string, options?: {
        includeSenderSignature?: boolean;
        multisignatureKeys?: {
            mandatoryKeys: Buffer[];
            optionalKeys: Buffer[];
        };
    }): Promise<Record<string, unknown>>;
    get(id: Buffer | string): Promise<Record<string, unknown>>;
    getFromPool(): Promise<Record<string, unknown>[]>;
    sign(transaction: Record<string, unknown>, passphrases: string[], options?: {
        includeSenderSignature?: boolean;
        multisignatureKeys?: {
            mandatoryKeys: Buffer[];
            optionalKeys: Buffer[];
        };
    }): Promise<Record<string, unknown>>;
    send(transaction: Record<string, unknown>): Promise<{
        transactionId: string;
    }>;
    decode<T = Record<string, unknown>>(transaction: Buffer | string): T;
    encode(transaction: Record<string, unknown>): Buffer;
    computeMinFee(transaction: Record<string, unknown>): bigint;
    toJSON(transaction: Record<string, unknown>): Record<string, unknown>;
    fromJSON(transaction: Record<string, unknown>): Record<string, unknown>;
}
