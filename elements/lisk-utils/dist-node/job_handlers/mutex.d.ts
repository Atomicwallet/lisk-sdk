declare type ReleaseFunc = () => void;
export declare class Mutex {
    private readonly _queue;
    private _locked;
    acquire(): Promise<ReleaseFunc>;
    isLocked(): boolean;
    runExclusive<T>(worker: () => Promise<T>): Promise<T>;
    private _tick;
}
export {};
