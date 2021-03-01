export declare const liskMetaSchema: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    properties: {
        $schema: {
            type: string;
            const: string;
            format: string;
        };
        $id: {
            type: string;
            format: string;
        };
        title: {
            type: string;
        };
        type: {
            type: string;
            const: string;
        };
        properties: {
            type: string;
            propertyNames: {
                type: string;
                format: string;
            };
            additionalProperties: {
                anyOf: ({
                    $ref: string;
                    type?: undefined;
                    properties?: undefined;
                } | {
                    type: string;
                    properties: {
                        type: {
                            type: string;
                            enum: string[];
                        };
                    };
                    $ref?: undefined;
                })[];
            };
            minProperties: number;
        };
        required: {
            type: string;
            items: {
                type: string;
            };
            uniqueItems: boolean;
        };
    };
    required: string[];
    additionalProperties: boolean;
    definitions: {
        schema: {
            allOf: {
                $ref: string;
            }[];
        };
    };
};
