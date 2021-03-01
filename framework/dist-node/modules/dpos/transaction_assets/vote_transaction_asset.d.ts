import { BaseAsset } from '../../base_asset';
import { VoteTransactionAssetContext } from '../types';
import { ApplyAssetContext, ValidateAssetContext } from '../../../types';
export declare class VoteTransactionAsset extends BaseAsset<VoteTransactionAssetContext> {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            votes: {
                type: string;
                minItems: number;
                maxItems: number;
                items: {
                    type: string;
                    required: string[];
                    properties: {
                        delegateAddress: {
                            dataType: string;
                            fieldNumber: number;
                            minLength: number;
                            maxLength: number;
                        };
                        amount: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                };
                fieldNumber: number;
            };
        };
    };
    validate({ asset }: ValidateAssetContext<VoteTransactionAssetContext>): void;
    apply({ asset, transaction, stateStore: store, reducerHandler, }: ApplyAssetContext<VoteTransactionAssetContext>): Promise<void>;
}
