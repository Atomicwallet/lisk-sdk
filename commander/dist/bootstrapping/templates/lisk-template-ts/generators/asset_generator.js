"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ts_morph_1 = require("ts-morph");
const Generator = require("yeoman-generator");
class AssetGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this._moduleName = opts.moduleName;
        this._assetName = opts.assetName;
        this._assetID = opts.assetID;
        this._templatePath = path_1.join(__dirname, '..', 'templates', 'asset');
        this._assetClass = `${this._assetName.charAt(0).toUpperCase() + this._assetName.slice(1)}Asset`;
        this._moduleClass = this._moduleName.charAt(0).toUpperCase() + this._moduleName.slice(1);
    }
    writing() {
        this.fs.copyTpl(`${this._templatePath}/src/app/modules/assets/asset.ts`, this.destinationPath(`src/app/modules/${this._moduleName}/assets/${this._assetName}.ts`), {
            moduleName: this._moduleName,
            assetName: this._assetName,
            assetClass: this._assetClass,
            assetID: this._assetID,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
        this.fs.copyTpl(`${this._templatePath}/test/unit/modules/assets/asset.spec.ts`, this.destinationPath(`test/unit/modules/${this._moduleName}/assets/${this._assetName}.spec.ts`), {
            moduleName: this._moduleName,
            assetName: this._assetName,
            assetClass: this._assetClass,
            assetID: this._assetID,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
    }
    async registerAsset() {
        this.log('Registering asset...');
        const project = new ts_morph_1.Project();
        project.addSourceFilesAtPaths('src/app/**/*.ts');
        const moduleFile = project.getSourceFileOrThrow(`src/app/modules/${this._moduleName}/${this._moduleName}.ts`);
        moduleFile.addImportDeclaration({
            namedImports: [this._assetClass],
            moduleSpecifier: `./assets/${this._assetName}`,
        });
        const moduleClass = moduleFile.getClassOrThrow(this._moduleClass);
        const property = moduleClass.getInstancePropertyOrThrow('transactionAssets');
        const value = property.getStructure().initializer;
        if (value === '[]' || value === '') {
            property.set({ initializer: `[${this._assetClass}]` });
        }
        else if (value.endsWith(']')) {
            property.set({ initializer: `${value.slice(0, -1)}, ${this._assetClass}]` });
        }
        else {
            this.log('Asset can not be registered. Please register it by yourself.');
        }
        moduleFile.organizeImports();
        await moduleFile.save();
    }
}
exports.default = AssetGenerator;
//# sourceMappingURL=asset_generator.js.map