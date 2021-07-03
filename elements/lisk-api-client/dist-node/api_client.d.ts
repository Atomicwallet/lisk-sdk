import { HashMap, InitOptions } from './api_types';
import * as constants from './constants';
import { AccountsResource } from './resources/accounts';
import { BlocksResource } from './resources/blocks';
import { DappsResource } from './resources/dapps';
import { DelegatesResource } from './resources/delegates';
import { NodeResource } from './resources/node';
import { PeersResource } from './resources/peers';
import { SignaturesResource } from './resources/signatures';
import { TransactionsResource } from './resources/transactions';
import { VotersResource } from './resources/voters';
import { VotesResource } from './resources/votes';
export interface ClientOptions {
    readonly engine?: string;
    readonly name?: string;
    readonly version?: string;
}
export declare class APIClient {
    static get constants(): typeof constants;
    static createMainnetAPIClient(options?: InitOptions): APIClient;
    static createTestnetAPIClient(options?: InitOptions): APIClient;
    accounts: AccountsResource;
    bannedNodes: ReadonlyArray<string>;
    blocks: BlocksResource;
    currentNode: string;
    dapps: DappsResource;
    delegates: DelegatesResource;
    headers: HashMap;
    node: NodeResource;
    nodes: ReadonlyArray<string>;
    peers: PeersResource;
    randomizeNodes: boolean;
    signatures: SignaturesResource;
    transactions: TransactionsResource;
    voters: VotersResource;
    votes: VotesResource;
    constructor(nodes: ReadonlyArray<string>, providedOptions?: InitOptions);
    banActiveNode(): boolean;
    banActiveNodeAndSelect(): boolean;
    banNode(node: string): boolean;
    getNewNode(): string;
    hasAvailableNodes(): boolean;
    initialize(nodes: ReadonlyArray<string>, providedOptions?: InitOptions): void;
    isBanned(node: string): boolean;
}
