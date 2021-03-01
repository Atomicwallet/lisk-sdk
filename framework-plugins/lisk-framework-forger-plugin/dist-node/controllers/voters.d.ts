import { BaseChannel, PluginCodec } from 'lisk-framework';
import { KVStore } from '@liskhq/lisk-db';
interface Voter {
    readonly address: string;
    readonly username: string;
    readonly totalVotesReceived: string;
    readonly voters: {
        readonly address: string;
        readonly amount: string;
    }[];
}
export declare const getVoters: (channel: BaseChannel, codec: PluginCodec, db: KVStore) => Promise<Voter[]>;
export {};
