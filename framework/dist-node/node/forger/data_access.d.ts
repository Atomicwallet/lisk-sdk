/// <reference types="node" />
import { BlockHeader } from '@liskhq/lisk-chain';
import { KVStore } from '@liskhq/lisk-db';
import { dataStructures } from '@liskhq/lisk-utils';
export declare const registeredHashOnionsStoreSchema: {
    title: string;
    $id: string;
    type: string;
    required: string[];
    properties: {
        registeredHashOnions: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                required: string[];
                properties: {
                    address: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    seedHash: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
    };
};
export declare const usedHashOnionsStoreSchema: {
    title: string;
    $id: string;
    type: string;
    required: string[];
    properties: {
        usedHashOnions: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                required: string[];
                properties: {
                    address: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    count: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    height: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
    };
};
export declare const previouslyForgedInfoSchema: {
    title: string;
    $id: string;
    type: string;
    required: string[];
    properties: {
        previouslyForgedInfo: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                required: string[];
                properties: {
                    generatorAddress: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    height: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    maxHeightPrevoted: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    maxHeightPreviouslyForged: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
    };
};
export interface RegisteredHash {
    [key: string]: Buffer;
}
export interface RegisteredHashOnionStoreObject {
    readonly registeredHashOnions: RegisteredHashOnion[];
}
export interface RegisteredHashOnion {
    readonly address: Buffer;
    readonly seedHash: Buffer;
}
export interface UsedHashOnionStoreObject {
    readonly usedHashOnions: UsedHashOnion[];
}
export interface UsedHashOnion {
    readonly count: number;
    readonly address: Buffer;
    readonly height: number;
}
export interface ForgedInfo {
    height: number;
    maxHeightPrevoted: number;
    maxHeightPreviouslyForged: number;
}
export interface ForgedInfoWithAddress extends ForgedInfo {
    generatorAddress: Buffer;
}
export interface PreviouslyForgedInfoStoreObject {
    previouslyForgedInfo: ForgedInfoWithAddress[];
}
export declare const getRegisteredHashOnionSeeds: (db: KVStore) => Promise<dataStructures.BufferMap<Buffer>>;
export declare const setRegisteredHashOnionSeeds: (db: KVStore, registeredHashOnionSeeds: dataStructures.BufferMap<Buffer>) => Promise<void>;
export declare const getUsedHashOnions: (db: KVStore) => Promise<UsedHashOnion[]>;
export declare const setUsedHashOnions: (db: KVStore, usedHashOnions: UsedHashOnion[]) => Promise<void>;
export declare const getPreviouslyForgedMap: (db: KVStore) => Promise<dataStructures.BufferMap<ForgedInfo>>;
export declare const setPreviouslyForgedMap: (db: KVStore, previouslyForgedMap: dataStructures.BufferMap<ForgedInfo>) => Promise<void>;
export declare const saveMaxHeightPreviouslyForged: (db: KVStore, header: BlockHeader, previouslyForgedMap: dataStructures.BufferMap<ForgedInfo>) => Promise<void>;
