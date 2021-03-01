export declare const postBlockEventSchema: {
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
export declare const transactionAnnouncementSchema: {
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
        };
    };
};
