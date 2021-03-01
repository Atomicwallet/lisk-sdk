import { Schema } from '@liskhq/lisk-codec';
export declare const blockSchema: {
    $id: string;
    type: string;
    properties: {
        header: {
            dataType: string;
            fieldNumber: number;
        };
        payload: {
            type: string;
            items: {
                dataType: string;
            };
            fieldNumber: number;
        };
    };
    required: string[];
};
export declare const signingBlockHeaderSchema: {
    $id: string;
    type: string;
    properties: {
        version: {
            dataType: string;
            fieldNumber: number;
        };
        timestamp: {
            dataType: string;
            fieldNumber: number;
        };
        height: {
            dataType: string;
            fieldNumber: number;
        };
        previousBlockID: {
            dataType: string;
            fieldNumber: number;
        };
        transactionRoot: {
            dataType: string;
            fieldNumber: number;
        };
        generatorPublicKey: {
            dataType: string;
            fieldNumber: number;
        };
        reward: {
            dataType: string;
            fieldNumber: number;
        };
        asset: {
            dataType: string;
            fieldNumber: number;
        };
    };
    required: string[];
};
export declare const blockHeaderSchema: {
    $id: string;
    properties: {
        signature: {
            dataType: string;
            fieldNumber: number;
        };
        version: {
            dataType: string;
            fieldNumber: number;
        };
        timestamp: {
            dataType: string;
            fieldNumber: number;
        };
        height: {
            dataType: string;
            fieldNumber: number;
        };
        previousBlockID: {
            dataType: string;
            fieldNumber: number;
        };
        transactionRoot: {
            dataType: string;
            fieldNumber: number;
        };
        generatorPublicKey: {
            dataType: string;
            fieldNumber: number;
        };
        reward: {
            dataType: string;
            fieldNumber: number;
        };
        asset: {
            dataType: string;
            fieldNumber: number;
        };
    };
    type: string;
    required: string[];
};
export declare const baseGenesisBlockHeaderAssetSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        accounts: {
            type: string;
            fieldNumber: number;
        };
        initDelegates: {
            type: string;
            items: {
                dataType: string;
            };
            fieldNumber: number;
            minItems: number;
        };
        initRounds: {
            dataType: string;
            fieldNumber: number;
            minimum: number;
        };
    };
};
export declare const baseAccountSchema: {
    $id: string;
    type: string;
    properties: {
        address: {
            dataType: string;
            fieldNumber: number;
        };
    };
    required: string[];
};
export declare const blockHeaderAssetSchema: {
    $id: string;
    type: string;
    properties: {
        maxHeightPreviouslyForged: {
            dataType: string;
            fieldNumber: number;
        };
        maxHeightPrevoted: {
            dataType: string;
            fieldNumber: number;
        };
        seedReveal: {
            dataType: string;
            minLength: number;
            maxLength: number;
            fieldNumber: number;
        };
    };
    required: string[];
};
export declare const stateDiffSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        updated: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                properties: {
                    key: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    value: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
        created: {
            type: string;
            fieldNumber: number;
            items: {
                dataType: string;
            };
        };
        deleted: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                properties: {
                    key: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    value: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
        };
    };
};
export declare const validatorsSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        validators: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                properties: {
                    address: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    minActiveHeight: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    isConsensusParticipant: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
                required: string[];
            };
        };
    };
};
export declare const getGenesisBlockHeaderAssetSchema: (accountSchema: Schema) => Schema;
export declare const getRegisteredBlockAssetSchema: (accountSchema: Schema) => {
    readonly [key: number]: Schema;
};
