export declare const schemas: {
    getBlocksFromIdRequest: {
        id: string;
        type: string;
        required: string[];
        properties: {
            blockId: {
                type: string;
                format: string;
            };
        };
    };
    getTransactionsRequest: {
        id: string;
        type: string;
        properties: {
            transactionIds: {
                type: string;
                items: {
                    type: string;
                    format: string;
                };
            };
        };
    };
    postBlockEvent: {
        id: string;
        type: string;
        required: string[];
        properties: {
            block: {
                type: string;
                format: string;
            };
        };
    };
    postTransactionsAnnouncementEvent: {
        id: string;
        type: string;
        required: string[];
        properties: {
            transactionIds: {
                type: string;
                items: {
                    type: string;
                    format: string;
                };
                minItems: number;
                maxItems: number;
            };
        };
    };
    getHighestCommonBlockRequest: {
        id: string;
        type: string;
        required: string[];
        properties: {
            ids: {
                type: string;
                items: {
                    type: string;
                    format: string;
                };
                uniqueItems: boolean;
                minItems: number;
            };
        };
    };
};
