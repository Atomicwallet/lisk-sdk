import { BaseGeneratorOptions } from '../../types';
import BaseGenerator from './base_generator';
interface AssetGeneratorOptions extends BaseGeneratorOptions {
    moduleName: string;
    assetName: string;
    assetID: number;
}
export default class AssetGenerator extends BaseGenerator {
    protected _liskAssetArgs: {
        moduleName: string;
        assetName: string;
        assetID: number;
    };
    constructor(args: string | string[], opts: AssetGeneratorOptions);
    initializing(): Promise<void>;
    writing(): void;
    end(): void;
}
export {};
