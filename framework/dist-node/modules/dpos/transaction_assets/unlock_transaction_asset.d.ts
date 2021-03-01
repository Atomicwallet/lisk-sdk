import { BaseAsset } from '../../base_asset';
import { ApplyAssetContext, ValidateAssetContext } from '../../../types';
import { UnlockTransactionAssetContext } from '../types';
export declare class UnlockTransactionAsset extends BaseAsset<UnlockTransactionAssetContext> {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            unlockObjects: {
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
                        unvoteHeight: {
                            dataType: string;
                            fieldNumber: number;
                        };
                    };
                };
                fieldNumber: number;
            };
        };
    };
    validate({ asset }: ValidateAssetContext<UnlockTransactionAssetContext>): void;
    apply({ asset, transaction, stateStore: store, reducerHandler, }: ApplyAssetContext<UnlockTransactionAssetContext>): Promise<void>;
}
