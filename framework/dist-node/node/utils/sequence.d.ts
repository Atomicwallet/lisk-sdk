interface SequenceConfig {
    readonly warningLimit?: number;
    readonly onWarning?: (length: number, limit: number) => void;
}
export declare class Sequence {
    private readonly _config;
    private readonly _queue;
    constructor(config?: SequenceConfig);
    add<T>(worker: () => Promise<T>): Promise<T>;
    count(): number;
    private _tick;
}
export {};
