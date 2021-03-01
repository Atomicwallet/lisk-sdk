export declare const baseTransactionSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        moduleID: {
            dataType: string;
            fieldNumber: number;
        };
        assetID: {
            dataType: string;
            fieldNumber: number;
        };
        nonce: {
            dataType: string;
            fieldNumber: number;
        };
        fee: {
            dataType: string;
            fieldNumber: number;
        };
        senderPublicKey: {
            dataType: string;
            fieldNumber: number;
        };
        asset: {
            dataType: string;
            fieldNumber: number;
        };
        signatures: {
            type: string;
            items: {
                dataType: string;
            };
            fieldNumber: number;
        };
    };
};
