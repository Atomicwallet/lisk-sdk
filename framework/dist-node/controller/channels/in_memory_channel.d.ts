import { EventCallback } from '../event';
import { BaseChannel } from './base_channel';
import { Bus } from '../bus';
export declare class InMemoryChannel extends BaseChannel {
    private bus;
    registerToBus(bus: Bus): Promise<void>;
    subscribe(eventName: string, cb: EventCallback): void;
    once(eventName: string, cb: EventCallback): void;
    publish(eventName: string, data?: Record<string, unknown>): void;
    invoke<T>(actionName: string, params?: Record<string, unknown>): Promise<T>;
}
