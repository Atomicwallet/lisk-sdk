import { APIClient } from '../api_client';
import { APIResource } from '../api_resource';
import { APIHandler } from '../api_types';
export declare class DelegatesResource extends APIResource {
    get: APIHandler;
    getForgers: APIHandler;
    getForgingStatistics: APIHandler;
    getStandby: APIHandler;
    path: string;
    constructor(apiClient: APIClient);
}
