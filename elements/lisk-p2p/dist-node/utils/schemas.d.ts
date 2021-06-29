export declare const packetSchema: {
    type: string;
    additionalProperties: boolean;
    properties: {
        event: {
            type: string;
        };
        cid: {
            type: string;
        };
        rid: {
            type: string;
        };
        data: {
            type: string;
        };
        error: {
            type: string;
        };
    };
};
export declare const protocolMessageSchema: {
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        event: {
            type: string;
        };
        data: {
            type: string;
        };
    };
};
export declare const rpcRequestSchema: {
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        procedure: {
            type: string;
        };
        data: {
            type: string;
        };
    };
};
