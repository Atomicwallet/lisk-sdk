export declare class P2PRequest {
    private readonly _procedure;
    private readonly _data;
    private readonly _respondCallback;
    private _wasResponseSent;
    constructor(procedure: string, data: unknown, respondCallback: (responseError?: Error, responseData?: unknown) => void);
    get procedure(): string;
    get data(): unknown;
    get wasResponseSent(): boolean;
    end(responseData?: unknown): void;
    error(responseError: Error): void;
}
