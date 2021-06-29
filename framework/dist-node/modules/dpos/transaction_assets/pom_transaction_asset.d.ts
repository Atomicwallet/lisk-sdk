import { BaseAsset } from '../../base_asset';
import { ApplyAssetContext, ValidateAssetContext } from '../../../types';
import { PomTransactionAssetContext } from '../types';
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
            type: string;
            fieldNumber: number;
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
                    fieldNumber: number;
                };
            };
            required: string[];
        };
    };
    type: string;
    required: string[];
};
export declare class PomTransactionAsset extends BaseAsset<PomTransactionAssetContext> {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            header1: {
                $id: string;
                fieldNumber: number;
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
                        type: string;
                        fieldNumber: number;
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
                                fieldNumber: number;
                            };
                        };
                        required: string[];
                    };
                };
                type: string;
                required: string[];
            };
            header2: {
                $id: string;
                fieldNumber: number;
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
                        type: string;
                        fieldNumber: number;
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
                                fieldNumber: number;
                            };
                        };
                        required: string[];
                    };
                };
                type: string;
                required: string[];
            };
        };
    };
    validate({ asset }: ValidateAssetContext<PomTransactionAssetContext>): void;
    apply({ asset, transaction, stateStore: store, reducerHandler, }: ApplyAssetContext<PomTransactionAssetContext>): Promise<void>;
}
