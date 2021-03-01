"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_generator_1 = require("./base_generator");
class ModuleGenerator extends base_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        this._liskModuleArgs = {
            moduleName: opts.moduleName,
            moduleID: opts.moduleID,
        };
    }
    async initializing() {
        await this._loadAndValidateTemplate();
    }
    writing() {
        this.log('Generating module skeleton.');
        this.composeWith({
            Generator: this._liskTemplate.generators.module,
            path: this._liskTemplatePath,
        }, this._liskModuleArgs);
    }
    end() {
        this.log('\n\n');
        this.log('Your module is created and ready to use.\n');
    }
}
exports.default = ModuleGenerator;
//# sourceMappingURL=module_generator.js.map