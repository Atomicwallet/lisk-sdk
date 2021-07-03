import { AxiosRequestConfig } from 'axios';
import { APIClient } from './api_client';
import { APIResponse, HashMap } from './api_types';
export declare class APIResource {
    apiClient: APIClient;
    path: string;
    constructor(apiClient: APIClient);
    get headers(): HashMap;
    get resourcePath(): string;
    handleRetry(error: Error, req: AxiosRequestConfig, retryCount: number): Promise<APIResponse>;
    request(req: AxiosRequestConfig, retry: boolean, retryCount?: number): Promise<APIResponse>;
}
