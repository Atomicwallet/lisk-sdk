import { NotificationRequest } from './jsonrpc';
export declare type EventCallback = (data?: Record<string, unknown>) => void | Promise<void>;
export declare type EventsDefinition = ReadonlyArray<string>;
export declare class Event {
    readonly module: string;
    readonly name: string;
    readonly data?: Record<string, unknown>;
    constructor(name: string, data?: Record<string, unknown>);
    static fromJSONRPCNotification(data: NotificationRequest | string): Event;
    toJSONRPCNotification(): NotificationRequest;
    key(): string;
}
