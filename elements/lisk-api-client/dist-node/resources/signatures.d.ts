import { APIClient } from '../api_client';
import { APIResource } from '../api_resource';
import { APIHandler } from '../api_types';
export declare class SignaturesResource extends APIResource {
    broadcast: APIHandler;
    path: string;
    constructor(apiClient: APIClient);
}
