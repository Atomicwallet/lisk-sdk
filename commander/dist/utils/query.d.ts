import { APIClient } from '@liskhq/lisk-api-client';
import { NodeResource } from '@liskhq/lisk-api-client/dist-node/resources/node';
interface APIResponse {
	readonly data?: unknown;
}
export declare const handleResponse: (
	endpoint: string,
	res: APIResponse,
	placeholder?: object,
) => unknown;
interface QueryParameter {
	readonly placeholder?: object;
	readonly query: object;
}
declare type EndpointTypes =
	| 'accounts'
	| 'blocks'
	| 'dapps'
	| 'delegates'
	| 'peers'
	| 'transactions'
	| 'voters'
	| 'votes';
export declare const query: (
	client: APIClient,
	endpoint: EndpointTypes,
	parameters: QueryParameter | ReadonlyArray<QueryParameter>,
) => Promise<unknown>;
export declare const queryNodeTransaction: (
	client: NodeResource,
	txnState: string,
	parameters: ReadonlyArray<QueryParameter>,
) => Promise<unknown>;
export {};
