import { Method } from 'axios';
export declare type APIHandler = (...args: Array<number | string | object>) => Promise<APIResponse>;
export interface APIResponse {
    readonly data: unknown;
    readonly links: object;
    readonly meta: object;
}
export interface APIErrorResponse {
    readonly error?: string;
    readonly errors?: ReadonlyArray<APIErrorContents>;
    readonly message?: string;
}
export interface APIErrorContents {
    readonly code?: string;
    readonly message?: string;
}
export interface HashMap {
    readonly [key: string]: string;
}
export interface InitOptions {
    readonly bannedNodes?: ReadonlyArray<string>;
    readonly client?: object;
    readonly nethash?: string;
    readonly node?: string;
    readonly randomizeNodes?: boolean;
}
export interface RequestConfig {
    readonly defaultData?: object;
    readonly method?: Method;
    readonly path?: string;
    readonly retry?: boolean;
    readonly urlParams?: ReadonlyArray<string>;
    readonly validator?: (data: {
        readonly needed?: string;
    }) => void;
}
export interface Resource {
    readonly headers: HashMap;
    readonly path: string;
    readonly request: (data: object, retry: boolean) => Promise<APIResponse>;
    readonly resourcePath: string;
}
