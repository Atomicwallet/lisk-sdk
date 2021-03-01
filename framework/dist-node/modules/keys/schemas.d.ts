export declare const keysSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        numberOfSignatures: {
            dataType: string;
            fieldNumber: number;
            minimum: number;
            maximum: number;
        };
        mandatoryKeys: {
            type: string;
            items: {
                dataType: string;
                minLength: number;
                maxLength: number;
            };
            fieldNumber: number;
            minItems: number;
            maxItems: number;
        };
        optionalKeys: {
            type: string;
            items: {
                dataType: string;
                minLength: number;
                maxLength: number;
            };
            fieldNumber: number;
            minItems: number;
            maxItems: number;
        };
    };
};
