"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_generator_1 = require("./base_generator");
class InitPluginGenerator extends base_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        this._liskInitPluginArgs = {
            alias: opts.alias,
        };
        this.env.options.skipInstall = true;
        this._registry = opts.registry;
    }
    async initializing() {
        await this._loadAndValidateTemplate();
        this.log('Initializing git repository');
        this.spawnCommandSync('git', ['init', '--quiet']);
    }
    configuring() {
        this.log('Updating .liskrc.json file');
        this._liskRC.setPath('template', this._liskTemplateName);
    }
    writing() {
        this.log('Creating plugin project structure');
        this.composeWith({
            Generator: this._liskTemplate.generators.initPlugin,
            path: this._liskTemplatePath,
        }, this._liskInitPluginArgs);
    }
    install() {
        this.log('\n');
        this.log('After completion of npm installation, customize your plugin to use with your blockchain application.\n');
    }
    end() {
        this.installDependencies({
            npm: this._registry ? { registry: this._registry } : true,
            bower: false,
            yarn: false,
            skipMessage: false,
        });
    }
}
exports.default = InitPluginGenerator;
//# sourceMappingURL=init_plugin_generator.js.map