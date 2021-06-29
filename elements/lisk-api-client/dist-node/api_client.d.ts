import { EventCallback, Channel, RegisteredSchemas } from './types';
import { Node } from './node';
import { Account } from './account';
import { Block } from './block';
import { Transaction } from './transaction';
export declare class APIClient {
    private readonly _channel;
    private _schemas;
    private _nodeInfo;
    private _node;
    private _account;
    private _block;
    private _transaction;
    constructor(channel: Channel);
    init(): Promise<void>;
    disconnect(): Promise<void>;
    invoke<T = Record<string, unknown>>(actionName: string, params?: Record<string, unknown>): Promise<T>;
    subscribe(eventName: string, cb: EventCallback): void;
    get schemas(): RegisteredSchemas;
    get node(): Node;
    get account(): Account;
    get block(): Block;
    get transaction(): Transaction;
}
