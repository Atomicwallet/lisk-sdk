import { APIClient } from '../api_client';
import { APIResource } from '../api_resource';
import { APIHandler } from '../api_types';
export declare class DappsResource extends APIResource {
    get: APIHandler;
    path: string;
    constructor(apiClient: APIClient);
}
