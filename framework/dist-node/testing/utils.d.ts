import { AccountDefaultProps, AccountSchema, BlockHeaderAsset } from '@liskhq/lisk-chain';
import { KVStore } from '@liskhq/lisk-db';
import { Logger } from '../logger';
import { BaseModule, BaseModuleChannel } from '../modules';
import { BaseModuleDataAccess, GenesisConfig } from '../types';
import { ModuleClass, WaitUntilBlockHeightOptions } from './types';
export declare const getAccountSchemaFromModules: (modules: ModuleClass[], genesisConfig?: GenesisConfig | undefined) => {
    [key: string]: AccountSchema;
};
export declare const getModuleInstance: <T1 extends BaseModule, T2 = AccountDefaultProps, T3 = BlockHeaderAsset>(Module: ModuleClass<T1>, opts?: {
    genesisConfig?: GenesisConfig | undefined;
    dataAccess?: BaseModuleDataAccess | undefined;
    channel?: BaseModuleChannel | undefined;
    logger?: Logger | undefined;
} | undefined) => T1;
export declare const waitUntilBlockHeight: ({ apiClient, height, timeout, }: WaitUntilBlockHeightOptions) => Promise<void>;
export declare const defaultAccountSchema: {
    token: {
        type: string;
        fieldNumber: number;
        properties: {
            balance: {
                fieldNumber: number;
                dataType: string;
            };
        };
        default: {
            balance: bigint;
        };
    };
    sequence: {
        type: string;
        fieldNumber: number;
        properties: {
            nonce: {
                fieldNumber: number;
                dataType: string;
            };
        };
        default: {
            nonce: bigint;
        };
    };
    keys: {
        type: string;
        fieldNumber: number;
        properties: {
            numberOfSignatures: {
                dataType: string;
                fieldNumber: number;
            };
            mandatoryKeys: {
                type: string;
                items: {
                    dataType: string;
                };
                fieldNumber: number;
            };
            optionalKeys: {
                type: string;
                items: {
                    dataType: string;
                };
                fieldNumber: number;
            };
        };
        default: {
            numberOfSignatures: number;
            mandatoryKeys: never[];
            optionalKeys: never[];
        };
    };
    dpos: {
        type: string;
        fieldNumber: number;
        properties: {
            delegate: {
                type: string;
                fieldNumber: number;
                properties: {
                    username: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    pomHeights: {
                        type: string;
                        items: {
                            dataType: string;
                        };
                        fieldNumber: number;
                    };
                    consecutiveMissedBlocks: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    lastForgedHeight: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    isBanned: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    totalVotesReceived: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
                required: string[];
            };
            sentVotes: {
                type: string;
                fieldNumber: number;
                items: {
                    type: string;
                    properties: {
                        delegateAddress: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        amount: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                    required: string[];
                };
            };
            unlocking: {
                type: string;
                fieldNumber: number;
                items: {
                    type: string;
                    properties: {
                        delegateAddress: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        amount: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        unvoteHeight: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                    required: string[];
                };
            };
        };
        default: {
            delegate: {
                username: string;
                pomHeights: never[];
                consecutiveMissedBlocks: number;
                lastForgedHeight: number;
                isBanned: boolean;
                totalVotesReceived: bigint;
            };
            sentVotes: never[];
            unlocking: never[];
        };
    };
};
export declare const getDBPath: (name: string, dbPath?: string) => string;
export declare const createDB: (name: string, dbPath?: string) => KVStore;
export declare const removeDB: (dbPath?: string) => void;
