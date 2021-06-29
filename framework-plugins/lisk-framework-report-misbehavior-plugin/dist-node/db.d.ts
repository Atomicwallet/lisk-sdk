/// <reference types="node" />
import { KVStore } from '@liskhq/lisk-db';
import { BlockHeader } from '@liskhq/lisk-chain';
import { RegisteredSchema } from 'lisk-framework';
export declare const blockHeadersSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        blockHeaders: {
            type: string;
            fieldNumber: number;
            items: {
                dataType: string;
            };
        };
    };
};
export interface BlockHeaderAsset {
    readonly seedReveal: Buffer;
    readonly maxHeightPreviouslyForged: number;
    readonly maxHeightPrevoted: number;
}
interface BlockHeaders {
    readonly blockHeaders: Buffer[];
}
export declare const getDBInstance: (dataPath: string, dbName?: string) => Promise<KVStore>;
export declare const getBlockHeaders: (db: KVStore, dbKeyBlockHeader: string) => Promise<BlockHeaders>;
export declare const decodeBlockHeader: (encodedHeader: Buffer, schema: RegisteredSchema) => BlockHeader;
export declare const saveBlockHeaders: (db: KVStore, schemas: RegisteredSchema, header: Buffer) => Promise<boolean>;
export declare const getContradictingBlockHeader: (db: KVStore, blockHeader: BlockHeader, schemas: RegisteredSchema) => Promise<BlockHeader | undefined>;
export declare const clearBlockHeaders: (db: KVStore, schemas: RegisteredSchema, currentHeight: number) => Promise<void>;
export {};
