"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_generator_1 = require("./base_generator");
class InitGenerator extends base_generator_1.default {
    async initializing() {
        await this._loadAndValidateTemplate();
        this.env.options.skipInstall = true;
        this.log('Initializing git repository');
        this.spawnCommandSync('git', ['init', '--quiet']);
    }
    configuring() {
        this.log('Updating .liskrc.json file');
        this._liskRC.setPath('template', this._liskTemplateName);
    }
    writing() {
        this.log('Creating project structure');
        this.composeWith({
            Generator: this._liskTemplate.generators.init,
            path: this._liskTemplatePath,
        });
    }
    install() {
        this.log('\n');
        this.installDependencies({
            npm: this._registry ? { registry: this._registry } : true,
            bower: false,
            yarn: false,
            skipMessage: false,
        });
    }
}
exports.default = InitGenerator;
//# sourceMappingURL=init_generator.js.map