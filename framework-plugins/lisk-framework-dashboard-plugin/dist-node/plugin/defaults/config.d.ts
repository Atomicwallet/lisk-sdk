export declare const config: {
    $id: string;
    type: string;
    properties: {
        applicationName: {
            type: string;
            description: string;
        };
        applicationUrl: {
            type: string;
            format: string;
            description: string;
        };
        port: {
            type: string;
            minimum: number;
            maximum: number;
        };
        host: {
            type: string;
            format: string;
        };
    };
    required: never[];
    default: {
        applicationUrl: string;
        port: number;
        host: string;
        applicationName: string;
    };
};
