export declare class Scheduler<T> {
    private _active;
    private _id;
    private readonly _interval;
    private readonly _job;
    constructor(job: () => Promise<T>, interval: number);
    start(): Promise<void>;
    stop(): void;
    private callJobAfterTimeout;
    private run;
}
