"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path_1 = require("path");
const Generator = require("yeoman-generator");
class InitPluginGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this._templatePath = path_1.join(__dirname, '..', 'templates', 'init_plugin');
        this._alias = this.options.alias;
        this._className = `${this._alias.charAt(0).toUpperCase() + this._alias.slice(1)}Plugin`;
    }
    async prompting() {
        this._answers = (await this.prompt([
            {
                type: 'input',
                name: 'author',
                message: 'Author of plugin',
                default: os_1.userInfo().username,
            },
            {
                type: 'input',
                name: 'version',
                message: 'Version of plugin',
                default: '0.1.0',
            },
            {
                type: 'input',
                name: 'name',
                message: 'Name of plugin',
                default: this._alias,
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description of plugin',
                default: 'A plugin for an application created by Lisk SDK',
            },
            {
                type: 'input',
                name: 'license',
                message: 'License of plugin',
                default: 'ISC',
            },
        ]));
    }
    createSkeleton() {
        var _a, _b, _c, _d, _e;
        this.fs.copyTpl(`${this._templatePath}/**/*`, this.destinationRoot(), {
            alias: this._alias,
            className: this._className,
            author: (_a = this._answers) === null || _a === void 0 ? void 0 : _a.author,
            version: (_b = this._answers) === null || _b === void 0 ? void 0 : _b.version,
            name: (_c = this._answers) === null || _c === void 0 ? void 0 : _c.name,
            description: (_d = this._answers) === null || _d === void 0 ? void 0 : _d.description,
            license: (_e = this._answers) === null || _e === void 0 ? void 0 : _e.license,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
    }
}
exports.default = InitPluginGenerator;
//# sourceMappingURL=init_plugin_generator.js.map