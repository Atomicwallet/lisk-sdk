/// <reference types="node" />
import { RequestOptions } from './types';
export declare class P2PRequest {
    private readonly _procedure;
    private readonly _data;
    private readonly _respondCallback;
    private readonly _peerId;
    private _wasResponseSent;
    private readonly _rate;
    constructor(options: RequestOptions, respondCallback: (responseError?: Error, responseData?: unknown) => void);
    get procedure(): string;
    get data(): Buffer | undefined;
    get rate(): number;
    get peerId(): string;
    get wasResponseSent(): boolean;
    end(responseData?: unknown): void;
    error(responseError: Error): void;
    private _getBase64Data;
    private _getBufferData;
}
