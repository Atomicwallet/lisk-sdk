export declare const forgerInfoSchema: {
    $id: string;
    type: string;
    properties: {
        totalProducedBlocks: {
            dataType: string;
            fieldNumber: number;
        };
        totalReceivedFees: {
            dataType: string;
            fieldNumber: number;
        };
        totalReceivedRewards: {
            dataType: string;
            fieldNumber: number;
        };
        votesReceived: {
            type: string;
            fieldNumber: number;
            items: {
                type: string;
                properties: {
                    address: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    amount: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
};
export declare const forgerSyncSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        syncUptoHeight: {
            dataType: string;
            fieldNumber: number;
        };
    };
};
