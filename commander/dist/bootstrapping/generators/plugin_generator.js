"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_generator_1 = require("./base_generator");
class PluginGenerator extends base_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        this._liskPluginArgs = {
            alias: opts.alias,
        };
    }
    async initializing() {
        await this._loadAndValidateTemplate();
    }
    writing() {
        this.log('Generating plugin skeleton');
        this.composeWith({
            Generator: this._liskTemplate.generators.plugin,
            path: this._liskTemplatePath,
        }, this._liskPluginArgs);
    }
    end() {
        this.log('\n\n');
        this.log('Finished creating plugin');
    }
}
exports.default = PluginGenerator;
//# sourceMappingURL=plugin_generator.js.map