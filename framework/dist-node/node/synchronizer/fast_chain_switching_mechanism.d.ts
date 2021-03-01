import { BFT } from '@liskhq/lisk-bft';
import { Chain, Block } from '@liskhq/lisk-chain';
import { BaseSynchronizer } from './base_synchronizer';
import { Processor } from '../processor';
import { Logger } from '../../logger';
import { InMemoryChannel } from '../../controller/channels';
import { Network } from '../network';
interface FastChainSwitchingMechanismInput {
    readonly logger: Logger;
    readonly channel: InMemoryChannel;
    readonly bft: BFT;
    readonly chain: Chain;
    readonly processor: Processor;
    readonly networkModule: Network;
}
export declare class FastChainSwitchingMechanism extends BaseSynchronizer {
    private readonly bft;
    private readonly processor;
    constructor({ logger, channel, chain, bft, processor, networkModule, }: FastChainSwitchingMechanismInput);
    run(receivedBlock: Block, peerId: string): Promise<void>;
    isValidFor(receivedBlock: Block, peerId: string): Promise<boolean>;
    private _requestBlocksWithinIDs;
    private _queryBlocks;
    private _validateBlocks;
    private _applyBlocks;
    private _handleBlockProcessingFailure;
    private _switchChain;
    private _computeLastTwoRoundsHeights;
    private _requestLastCommonBlock;
}
export {};
