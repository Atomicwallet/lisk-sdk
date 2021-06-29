export declare const getBlocksFromIdRequestSchema: {
    $id: string;
    title: string;
    type: string;
    required: string[];
    properties: {
        blockId: {
            fieldNumber: number;
            dataType: string;
        };
    };
};
export declare const getBlocksFromIdResponseSchema: {
    $id: string;
    title: string;
    type: string;
    required: string[];
    properties: {
        blocks: {
            type: string;
            fieldNumber: number;
            items: {
                dataType: string;
            };
        };
    };
};
export declare const getHighestCommonBlockRequestSchema: {
    $id: string;
    title: string;
    type: string;
    required: string[];
    properties: {
        ids: {
            type: string;
            fieldNumber: number;
            minItems: number;
            items: {
                dataType: string;
            };
        };
    };
};
export declare const transactionIdsSchema: {
    $id: string;
    title: string;
    type: string;
    required: string[];
    properties: {
        transactionIds: {
            type: string;
            fieldNumber: number;
            minItems: number;
            maxItems: number;
            items: {
                dataType: string;
            };
        };
    };
};
export declare const transactionsSchema: {
    $id: string;
    title: string;
    type: string;
    required: string[];
    properties: {
        transactions: {
            type: string;
            fieldNumber: number;
            items: {
                dataType: string;
            };
        };
    };
};
export declare const postBlockEventSchema: {
    $id: string;
    title: string;
    type: string;
    required: string[];
    properties: {
        block: {
            dataType: string;
            fieldNumber: number;
        };
    };
};
