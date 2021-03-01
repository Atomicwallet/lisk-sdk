import { BFT } from '@liskhq/lisk-bft';
import { Block, Chain } from '@liskhq/lisk-chain';
import { BaseSynchronizer } from './base_synchronizer';
import { Processor } from '../processor';
import { Logger } from '../../logger';
import { InMemoryChannel } from '../../controller/channels';
import { Network } from '../network';
interface BlockSynchronizationMechanismInput {
    readonly logger: Logger;
    readonly channel: InMemoryChannel;
    readonly bft: BFT;
    readonly chain: Chain;
    readonly processorModule: Processor;
    readonly networkModule: Network;
}
export declare class BlockSynchronizationMechanism extends BaseSynchronizer {
    private readonly bft;
    private readonly processorModule;
    constructor({ logger, channel, bft, chain, processorModule, networkModule, }: BlockSynchronizationMechanismInput);
    run(receivedBlock: Block): Promise<void>;
    isValidFor(): Promise<boolean>;
    private _requestAndApplyBlocksWithinIDs;
    private _handleBlockProcessingError;
    private _requestAndApplyBlocksToCurrentChain;
    private _revertToLastCommonBlock;
    private _requestLastCommonBlock;
    private _requestAndValidateLastBlock;
    private _blockDetachedStatus;
    private _computeBestPeer;
}
export {};
