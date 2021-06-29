export declare const config: {
    $id: string;
    type: string;
    properties: {
        port: {
            type: string;
            minimum: number;
            maximum: number;
        };
        host: {
            type: string;
            format: string;
        };
        encryptedPassphrase: {
            type: string;
            format: string;
            description: string;
        };
        applicationUrl: {
            type: string;
            format: string;
            description: string;
        };
        fee: {
            type: string;
            description: string;
        };
        amount: {
            type: string;
            description: string;
        };
        tokenPrefix: {
            type: string;
            description: string;
        };
        logoURL: {
            type: string;
            format: string;
            description: string;
        };
        captchaSecretkey: {
            type: string;
            description: string;
        };
        captchaSitekey: {
            type: string;
            description: string;
        };
    };
    required: string[];
    default: {
        port: number;
        host: string;
        applicationUrl: string;
        fee: string;
        amount: string;
        tokenPrefix: string;
    };
};
