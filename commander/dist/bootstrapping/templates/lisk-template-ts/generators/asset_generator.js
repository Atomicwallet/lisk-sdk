"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ts_morph_1 = require("ts-morph");
const Generator = require("yeoman-generator");
const convert_1 = require("../../../../utils/convert");
class AssetGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this._moduleName = opts.moduleName;
        this._assetName = opts.assetName;
        this._assetID = opts.assetID;
        this._moduleFileName = convert_1.camelToSnake(this._moduleName);
        this._templatePath = path_1.join(__dirname, '..', 'templates', 'asset');
        this._assetClass = `${convert_1.camelToPascal(this._assetName)}Asset`;
        this._assetFileName = `${convert_1.camelToSnake(this._assetName)}_asset`;
        this._moduleClass = `${convert_1.camelToPascal(this._moduleName)}Module`;
    }
    writing() {
        this.fs.copyTpl(`${this._templatePath}/src/app/modules/assets/asset.ts`, this.destinationPath(`src/app/modules/${this._moduleFileName}/assets/${this._assetFileName}.ts`), {
            moduleName: this._moduleName,
            assetName: this._assetName,
            assetClass: this._assetClass,
            assetID: this._assetID,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
        this.fs.copyTpl(`${this._templatePath}/test/unit/modules/assets/asset.spec.ts`, this.destinationPath(`test/unit/modules/${this._moduleFileName}/assets/${this._assetFileName}.spec.ts`), {
            moduleName: this._moduleName,
            assetName: this._assetName,
            assetFileName: this._assetFileName,
            assetClass: this._assetClass,
            assetID: this._assetID,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
    }
    async registerAsset() {
        this.log('Registering asset...');
        const project = new ts_morph_1.Project();
        project.addSourceFilesAtPaths('src/app/**/*.ts');
        const moduleFile = project.getSourceFileOrThrow(`src/app/modules/${this._moduleFileName}/${this._moduleFileName}_module.ts`);
        moduleFile.addImportDeclaration({
            namedImports: [this._assetClass],
            moduleSpecifier: `./assets/${this._assetFileName}`,
        });
        const moduleClass = moduleFile.getClassOrThrow(this._moduleClass);
        const property = moduleClass.getInstancePropertyOrThrow('transactionAssets');
        const value = property.getStructure().initializer;
        if (value === '[]' || value === '') {
            property.set({ initializer: `[new ${this._assetClass}()]` });
        }
        else if (value.endsWith(']')) {
            property.set({ initializer: `${value.slice(0, -1)}, new ${this._assetClass}()]` });
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