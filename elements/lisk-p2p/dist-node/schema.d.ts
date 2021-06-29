import { Schema } from '@liskhq/lisk-codec';
export declare const nodeInfoSchema: {
    $id: string;
    type: string;
    properties: {
        networkIdentifier: {
            dataType: string;
            fieldNumber: number;
        };
        networkVersion: {
            dataType: string;
            fieldNumber: number;
        };
        nonce: {
            dataType: string;
            fieldNumber: number;
        };
        advertiseAddress: {
            dataType: string;
            fieldNumber: number;
        };
    };
    required: string[];
};
export declare const peerInfoSchema: {
    $id: string;
    type: string;
    properties: {
        ipAddress: {
            dataType: string;
            fieldNumber: number;
        };
        port: {
            dataType: string;
            fieldNumber: number;
        };
    };
    required: string[];
};
export declare const peerRequestResponseSchema: {
    $id: string;
    type: string;
    properties: {
        peers: {
            type: string;
            fieldNumber: number;
            items: {
                dataType: string;
            };
        };
    };
    required: string[];
};
export declare const defaultRPCSchemas: {
    peerInfo: {
        $id: string;
        type: string;
        properties: {
            ipAddress: {
                dataType: string;
                fieldNumber: number;
            };
            port: {
                dataType: string;
                fieldNumber: number;
            };
        };
        required: string[];
    };
    nodeInfo: {
        $id: string;
        type: string;
        properties: {
            networkIdentifier: {
                dataType: string;
                fieldNumber: number;
            };
            networkVersion: {
                dataType: string;
                fieldNumber: number;
            };
            nonce: {
                dataType: string;
                fieldNumber: number;
            };
            advertiseAddress: {
                dataType: string;
                fieldNumber: number;
            };
        };
        required: string[];
    };
    peerRequestResponse: {
        $id: string;
        type: string;
        properties: {
            peers: {
                type: string;
                fieldNumber: number;
                items: {
                    dataType: string;
                };
            };
        };
        required: string[];
    };
};
export declare const mergeCustomSchema: (baseSchema: Schema, customSchema: Schema) => Schema;
