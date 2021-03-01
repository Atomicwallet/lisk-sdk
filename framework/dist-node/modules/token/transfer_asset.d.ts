import { Asset } from './types';
import { BaseAsset } from '../base_asset';
import { ApplyAssetContext } from '../../types';
export declare class TransferAsset extends BaseAsset {
    name: string;
    id: number;
    schema: {
        $id: string;
        title: string;
        type: string;
        required: string[];
        properties: {
            amount: {
                dataType: string;
                fieldNumber: number;
            };
            recipientAddress: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
            data: {
                dataType: string;
                fieldNumber: number;
                minLength: number;
                maxLength: number;
            };
        };
    };
    private readonly _minRemainingBalance;
    constructor(minRemainingBalance: bigint);
    apply({ asset, transaction, stateStore }: ApplyAssetContext<Asset>): Promise<void>;
}
