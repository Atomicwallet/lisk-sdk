import { BaseChannel } from 'lisk-framework';
interface NetworkStats {
    [key: string]: unknown;
}
export declare const getNetworkStats: (channel: BaseChannel) => Promise<NetworkStats>;
export {};
