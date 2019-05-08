import { APIClient } from '../api_client';
import { APIResource } from '../api_resource';
import { APIHandler } from '../api_types';
export declare class NodeResource extends APIResource {
    getConstants: APIHandler;
    getForgingStatus: APIHandler;
    getStatus: APIHandler;
    getTransactions: APIHandler;
    path: string;
    updateForgingStatus: APIHandler;
    constructor(apiClient: APIClient);
}
