"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ts_morph_1 = require("ts-morph");
const Generator = require("yeoman-generator");
const convert_1 = require("../../../../utils/convert");
class PluginGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this._templatePath = path_1.join(__dirname, '..', 'templates', 'plugin');
        this._alias = this.options.alias;
        this._pluginFileName = convert_1.camelToSnake(this._alias);
        this._className = `${this._alias.charAt(0).toUpperCase() + this._alias.slice(1)}Plugin`;
    }
    async prompting() {
        try {
            this._packageJSON = await Promise.resolve().then(() => require(this.destinationPath('package.json')));
        }
        catch (err) {
            this._packageJSON = undefined;
        }
        this._answers = this._packageJSON
            ? undefined
            : (await this.prompt([
                {
                    type: 'input',
                    name: 'author',
                    message: 'Author of plugin',
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
                },
            ]));
    }
    writing() {
        var _a, _b, _c, _d, _e, _f;
        this.fs.copyTpl(`${this._templatePath}/src/app/plugins/plugin.ts`, this.destinationPath(`src/app/plugins/${this._pluginFileName}/${this._pluginFileName}_plugin.ts`), {
            alias: this._alias,
            className: this._className,
            author: (_b = (_a = this._packageJSON) === null || _a === void 0 ? void 0 : _a.author) !== null && _b !== void 0 ? _b : (_c = this._answers) === null || _c === void 0 ? void 0 : _c.author,
            version: (_e = (_d = this._packageJSON) === null || _d === void 0 ? void 0 : _d.version) !== null && _e !== void 0 ? _e : (_f = this._answers) === null || _f === void 0 ? void 0 : _f.version,
            name: this._alias,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
        this.fs.copyTpl(`${this._templatePath}/test/unit/plugins/plugin.spec.ts`, this.destinationPath(`test/unit/plugins/${this._pluginFileName}/${this._pluginFileName}_plugin.spec.ts`), {
            alias: this._alias,
            className: this._className,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
    }
    async registerPlugin() {
        this.log('Registering plugin...');
        const project = new ts_morph_1.Project();
        project.addSourceFilesAtPaths('src/app/**/*.ts');
        const pluginsFile = project.getSourceFileOrThrow('src/app/plugins.ts');
        pluginsFile.addImportDeclaration({
            namedImports: [`${this._className}`],
            moduleSpecifier: `./plugins/${this._pluginFileName}/${this._pluginFileName}_plugin`,
        });
        const registerFunction = pluginsFile
            .getVariableDeclarationOrThrow('registerPlugins')
            .getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.ArrowFunction);
        registerFunction.setBodyText(`${registerFunction.getBodyText()}\napp.registerPlugin(${this._className});`);
        pluginsFile.organizeImports();
        await pluginsFile.save();
    }
}
exports.default = PluginGenerator;
//# sourceMappingURL=plugin_generator.js.map