import { Schema } from '@liskhq/lisk-codec';
import { ValidateAssetContext, ApplyAssetContext } from '../types';
export declare abstract class BaseAsset<T = unknown> {
    abstract name: string;
    abstract id: number;
    abstract schema: Schema;
    validate?(context: ValidateAssetContext<T>): void;
    abstract apply(context: ApplyAssetContext<T>): Promise<void>;
}
