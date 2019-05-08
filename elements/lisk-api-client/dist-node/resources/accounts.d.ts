import { APIClient } from '../api_client';
import { APIResource } from '../api_resource';
import { APIHandler } from '../api_types';
export declare class AccountsResource extends APIResource {
    get: APIHandler;
    getMultisignatureGroups: APIHandler;
    getMultisignatureMemberships: APIHandler;
    path: string;
    constructor(apiClient: APIClient);
}
