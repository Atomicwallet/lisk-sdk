/// <reference types="node" />
import { Block, Chain, BlockHeader } from '@liskhq/lisk-chain';
import { EventEmitter } from 'events';
import { Logger } from '../../logger';
import { InMemoryChannel } from '../../controller/channels';
import { Network } from '../network';
export declare const EVENT_SYNCHRONIZER_SYNC_REQUIRED = "EVENT_SYNCHRONIZER_SYNC_REQUIRED";
export declare abstract class BaseSynchronizer {
    events: EventEmitter;
    protected _logger: Logger;
    protected _channel: InMemoryChannel;
    protected _chain: Chain;
    protected _networkModule: Network;
    protected _stop: boolean;
    constructor(logger: Logger, channel: InMemoryChannel, chain: Chain, network: Network);
    stop(): void;
    protected _restartSync(receivedBlock: Block, reason: string): void;
    protected _applyPenaltyAndRestartSync(peerId: string, receivedBlock: Block, reason: string): void;
    protected _getLastBlockFromNetwork(peerId: string): Promise<Block>;
    protected _getHighestCommonBlockFromNetwork(peerId: string, ids: Buffer[]): Promise<BlockHeader>;
    protected _getBlocksFromNetwork(peerId: string, fromID: Buffer): Promise<Block[]>;
    abstract run(receivedBlock: Block, peerId: string): Promise<void>;
    abstract isValidFor(receivedBlock: Block, peerId: string): Promise<boolean>;
}
