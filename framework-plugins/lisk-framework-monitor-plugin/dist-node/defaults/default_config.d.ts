export declare const defaultConfig: {
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
        whiteList: {
            type: string;
            items: {
                type: string;
            };
        };
        cors: {
            type: string;
            properties: {
                origin: {
                    anyOf: {
                        type: string;
                    }[];
                };
                methods: {
                    type: string;
                };
            };
            required: string[];
        };
        limits: {
            type: string;
            properties: {
                max: {
                    type: string;
                };
                delayMs: {
                    type: string;
                };
                delayAfter: {
                    type: string;
                };
                windowMs: {
                    type: string;
                };
                headersTimeout: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                serverSetTimeout: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
            };
            required: string[];
        };
    };
    required: string[];
    default: {
        port: number;
        host: string;
        whiteList: string[];
        cors: {
            origin: string;
            methods: string[];
        };
        limits: {
            max: number;
            delayMs: number;
            delayAfter: number;
            windowMs: number;
            headersTimeout: number;
            serverSetTimeout: number;
        };
    };
};
