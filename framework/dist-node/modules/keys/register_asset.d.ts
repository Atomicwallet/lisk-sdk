/// <reference types="node" />
import { BaseAsset } from '../base_asset';
import { ApplyAssetContext, ValidateAssetContext } from '../../types';
export interface Asset {
    mandatoryKeys: Array<Readonly<Buffer>>;
    optionalKeys: Array<Readonly<Buffer>>;
    readonly numberOfSignatures: number;
}
export declare const RegisterAssetID = 0;
export declare const MAX_KEYS_COUNT = 64;
export declare class RegisterAsset extends BaseAsset {
    name: string;
    id: number;
    schema: {
        $id: string;
        type: string;
        required: string[];
        properties: {
            numberOfSignatures: {
                dataType: string;
                fieldNumber: number;
                minimum: number;
                maximum: number;
            };
            mandatoryKeys: {
                type: string;
                items: {
                    dataType: string;
                    minLength: number;
                    maxLength: number;
                };
                fieldNumber: number;
                minItems: number;
                maxItems: number;
            };
            optionalKeys: {
                type: string;
                items: {
                    dataType: string;
                    minLength: number;
                    maxLength: number;
                };
                fieldNumber: number;
                minItems: number;
                maxItems: number;
            };
        };
    };
    validate({ asset, transaction }: ValidateAssetContext<Asset>): void;
    apply({ asset, stateStore, transaction }: ApplyAssetContext<Asset>): Promise<void>;
}
