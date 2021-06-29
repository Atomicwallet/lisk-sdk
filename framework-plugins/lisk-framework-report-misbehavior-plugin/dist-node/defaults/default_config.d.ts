export declare const defaultConfig: {
    type: string;
    properties: {
        cleanupFrequency: {
            type: string;
            description: string;
        };
        encryptedPassphrase: {
            type: string;
            format: string;
        };
        defaultPassword: {
            type: string;
        };
        dataPath: {
            type: string;
            format: string;
            examples: string[];
            description: string;
        };
        fee: {
            type: string;
            description: string;
        };
    };
    required: never[];
    default: {
        cleanupFrequency: number;
        encryptedPassphrase: string;
        defaultPassword: string;
        fee: number;
    };
};
