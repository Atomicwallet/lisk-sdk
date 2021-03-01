import { BaseAsset } from '../../base_asset';
import { ApplyAssetContext, ValidateAssetContext } from '../../../types';
import { RegisterTransactionAssetContext } from '../types';
export declare class RegisterTransactionAsset extends BaseAsset<RegisterTransactionAssetContext> {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            username: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
        };
    };
    validate({ asset }: ValidateAssetContext<RegisterTransactionAssetContext>): void;
    apply({ asset, transaction, stateStore, }: ApplyAssetContext<RegisterTransactionAssetContext>): Promise<void>;
}
