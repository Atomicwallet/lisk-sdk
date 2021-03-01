export declare const CommonBlock: {
    id: string;
    type: string;
    format: string;
};
export declare const WSBlocksList: {
    id: string;
    type: string;
    items: {
        type: string;
        format: string;
    };
};
export declare const WSTransactionsResponse: {
    id: string;
    type: string;
    required: string[];
    properties: {
        transactions: {
            type: string;
            uniqueItems: boolean;
            maxItems: number;
            items: {
                type: string;
                format: string;
            };
        };
    };
};
