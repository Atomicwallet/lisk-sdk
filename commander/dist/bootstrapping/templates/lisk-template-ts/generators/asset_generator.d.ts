import * as Generator from 'yeoman-generator';
interface AssetGeneratorOptions extends Generator.GeneratorOptions {
    moduleName: string;
    assetName: string;
    assetID: number;
}
export default class AssetGenerator extends Generator {
    protected _moduleClass: string;
    protected _moduleName: string;
    protected _moduleFileName: string;
    protected _assetName: string;
    protected _assetID: number;
    protected _assetFileName: string;
    protected _templatePath: string;
    protected _assetClass: string;
    constructor(args: string | string[], opts: AssetGeneratorOptions);
    writing(): void;
    registerAsset(): Promise<void>;
}
export {};
