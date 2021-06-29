"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YeomanGenerator = require("yeoman-generator");
const installActions = require("yeoman-generator/lib/actions/install");
const path_1 = require("path");
const assert = require("assert");
Object.assign(YeomanGenerator.prototype, installActions);
const DEFAULT_TEMPLATE_NAME = 'lisk-ts';
class BaseGenerator extends YeomanGenerator {
    constructor(args, opts) {
        var _a, _b;
        super(args, opts);
        if (opts.projectPath) {
            this.destinationRoot(opts.projectPath);
        }
        this._registry = opts.registry;
        this._liskRC = this.createStorage('.liskrc.json');
        this._liskTemplateName = (_b = (_a = opts.template) !== null && _a !== void 0 ? _a : this._liskRC.getPath('template')) !== null && _b !== void 0 ? _b : 'lisk-ts';
        this._commanderVersion = opts.version;
        if (this._liskTemplateName === DEFAULT_TEMPLATE_NAME) {
            this._liskTemplatePath = path_1.join(path_1.dirname(__filename), '..', 'templates', 'lisk-template-ts');
        }
        else {
            this._liskTemplatePath = require.resolve(this._liskTemplateName);
        }
        this.log(`Using template "${this._liskTemplateName}"`);
        this._liskRC.setPath('commander.version', this._commanderVersion);
        this._liskRC.setPath('template', this._liskTemplateName);
        this.sourceRoot(this._liskTemplatePath);
    }
    async _loadAndValidateTemplate() {
        this._liskTemplate = (await Promise.resolve().then(() => require(this._liskTemplatePath)));
        assert(this._liskTemplate.generators, `Template "${this._liskTemplateName}" does not have any generators`);
        assert(this._liskTemplate.generators.init, `Template "${this._liskTemplateName}" does not have "init" generators`);
    }
}
exports.default = BaseGenerator;
//# sourceMappingURL=base_generator.js.map