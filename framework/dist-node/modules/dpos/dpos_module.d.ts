import { Account } from '@liskhq/lisk-chain';
import { AfterBlockApplyContext, AfterGenesisBlockApplyContext, GenesisConfig } from '../../types';
import { BaseModule } from '../base_module';
import { Rounds } from './rounds';
import { PomTransactionAsset } from './transaction_assets/pom_transaction_asset';
import { RegisterTransactionAsset } from './transaction_assets/register_transaction_asset';
import { UnlockTransactionAsset } from './transaction_assets/unlock_transaction_asset';
import { VoteTransactionAsset } from './transaction_assets/vote_transaction_asset';
import { DPOSAccountProps } from './types';
export declare class DPoSModule extends BaseModule {
    name: string;
    id: number;
    accountSchema: {
        type: string;
        properties: {
            delegate: {
                type: string;
                fieldNumber: number;
                properties: {
                    username: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    pomHeights: {
                        type: string;
                        items: {
                            dataType: string;
                        };
                        fieldNumber: number;
                    };
                    consecutiveMissedBlocks: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    lastForgedHeight: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    isBanned: {
                        dataType: string;
                        fieldNumber: number;
                    };
                    totalVotesReceived: {
                        dataType: string;
                        fieldNumber: number;
                    };
                };
                required: string[];
            };
            sentVotes: {
                type: string;
                fieldNumber: number;
                items: {
                    type: string;
                    properties: {
                        delegateAddress: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        amount: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                    required: string[];
                };
            };
            unlocking: {
                type: string;
                fieldNumber: number;
                items: {
                    type: string;
                    properties: {
                        delegateAddress: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        amount: {
                            dataType: string;
                            fieldNumber: number;
                        };
                        unvoteHeight: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                    required: string[];
                };
            };
        };
        default: {
            delegate: {
                username: string;
                pomHeights: never[];
                consecutiveMissedBlocks: number;
                lastForgedHeight: number;
                isBanned: boolean;
                totalVotesReceived: bigint;
            };
            sentVotes: never[];
            unlocking: never[];
        };
    };
    readonly rounds: Rounds;
    readonly transactionAssets: (PomTransactionAsset | RegisterTransactionAsset | UnlockTransactionAsset | VoteTransactionAsset)[];
    private readonly _activeDelegates;
    private readonly _standbyDelegates;
    private readonly _delegateListRoundOffset;
    private readonly _blocksPerRound;
    private readonly _delegateActiveRoundLimit;
    private readonly _blockTime;
    private _finalizedHeight;
    constructor(config: GenesisConfig);
    afterBlockApply(context: AfterBlockApplyContext): Promise<void>;
    afterGenesisBlockApply<T = Account<DPOSAccountProps>>(context: AfterGenesisBlockApplyContext<T>): Promise<void>;
    private _updateProductivity;
    private _createVoteWeightSnapshot;
    private _updateValidators;
    private _isLastBlockOfTheRound;
}
