"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_generator_1 = require("./base_generator");
class AssetGenerator extends base_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        this._liskAssetArgs = {
            moduleName: opts.moduleName,
            assetName: opts.assetName,
            assetID: opts.assetID,
        };
    }
    async initializing() {
        await this._loadAndValidateTemplate();
    }
    writing() {
        this.log('Generating asset skeleton.');
        this.composeWith({
            Generator: this._liskTemplate.generators.asset,
            path: this._liskTemplatePath,
        }, this._liskAssetArgs);
    }
    end() {
        this.log('\n\n');
        this.log('Your asset is created and ready to use.\n');
    }
}
exports.default = AssetGenerator;
//# sourceMappingURL=asset_generator.js.map