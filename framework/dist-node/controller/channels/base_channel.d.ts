import { EventCallback } from '../event';
import { Action, ActionsDefinition } from '../action';
export interface BaseChannelOptions {
    [key: string]: unknown;
    readonly skipInternalEvents?: boolean;
}
export declare abstract class BaseChannel {
    readonly eventsList: ReadonlyArray<string>;
    readonly actionsList: ReadonlyArray<string>;
    readonly moduleAlias: string;
    protected readonly actions: {
        [key: string]: Action;
    };
    protected readonly options: Record<string, unknown>;
    constructor(moduleAlias: string, events: ReadonlyArray<string>, actions: ActionsDefinition, options?: BaseChannelOptions);
    isValidEventName(name: string, throwError?: boolean): boolean | never;
    isValidActionName(name: string, throwError?: boolean): boolean | never;
    abstract subscribe(eventName: string, cb: EventCallback): void;
    abstract publish(eventName: string, data?: object): void;
    abstract invoke<T>(actionName: string, params?: object): Promise<T>;
    abstract registerToBus(arg: unknown): Promise<void>;
    abstract once(eventName: string, cb: EventCallback): void;
}
