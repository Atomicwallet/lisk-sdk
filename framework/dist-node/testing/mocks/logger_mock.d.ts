export declare const loggerMock: {
    trace: (_data?: object | unknown, _message?: string | undefined) => void;
    debug: (_data?: object | unknown, _message?: string | undefined) => void;
    info: (_data?: object | unknown, _message?: string | undefined) => void;
    warn: (_data?: object | unknown, _message?: string | undefined) => void;
    error: (_data?: object | unknown, _message?: string | undefined) => void;
    fatal: (_data?: object | unknown, _message?: string | undefined) => void;
    level: () => number;
};
