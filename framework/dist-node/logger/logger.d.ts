export declare const createDirIfNotExist: (filePath: string) => void;
interface LoggerInput {
    readonly fileLogLevel: string;
    readonly consoleLogLevel: string;
    readonly logFilePath: string;
    readonly module: string;
}
export interface Logger {
    readonly trace: (data?: object | unknown, message?: string) => void;
    readonly debug: (data?: object | unknown, message?: string) => void;
    readonly info: (data?: object | unknown, message?: string) => void;
    readonly warn: (data?: object | unknown, message?: string) => void;
    readonly error: (data?: object | unknown, message?: string) => void;
    readonly fatal: (data?: object | unknown, message?: string) => void;
    readonly level: () => number;
}
export declare const createLogger: ({ fileLogLevel, consoleLogLevel, logFilePath, module, }: LoggerInput) => Logger;
export {};
