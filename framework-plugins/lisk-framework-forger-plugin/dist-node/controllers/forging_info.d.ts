import { BaseChannel, PluginCodec } from 'lisk-framework';
import { KVStore } from '@liskhq/lisk-db';
import { Forger } from '../types';
interface ForgerInfo extends Forger {
    readonly username: string;
    readonly totalReceivedFees: string;
    readonly totalReceivedRewards: string;
    readonly totalProducedBlocks: number;
    readonly totalVotesReceived: string;
    readonly consecutiveMissedBlocks: number;
}
export declare const getForgingInfo: (channel: BaseChannel, codec: PluginCodec, db: KVStore) => Promise<ForgerInfo[]>;
export {};
