"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ts_morph_1 = require("ts-morph");
const Generator = require("yeoman-generator");
class ModuleGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this._templatePath = path_1.join(__dirname, '..', 'templates', 'module');
        this._moduleName = this.options.moduleName;
        this._moduleID = this.options.moduleID;
        this._moduleClass = this._moduleName.charAt(0).toUpperCase() + this._moduleName.slice(1);
    }
    writing() {
        this.fs.copyTpl(`${this._templatePath}/src/app/modules/module.ts`, this.destinationPath(`src/app/modules/${this._moduleName}/${this._moduleName}.ts`), {
            moduleName: this._moduleName,
            moduleID: this._moduleID,
            moduleClass: this._moduleClass,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
        this.fs.copyTpl(`${this._templatePath}/test/unit/modules/module.spec.ts`, this.destinationPath(`test/unit/modules/${this._moduleName}/${this._moduleName}.spec.ts`), {
            moduleClass: this._moduleClass,
            moduleName: this._moduleName,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
    }
    async registerModule() {
        this.log('Registering module...');
        const project = new ts_morph_1.Project();
        project.addSourceFilesAtPaths('src/app/**/*.ts');
        const modulesFile = project.getSourceFileOrThrow('src/app/modules.ts');
        modulesFile.addImportDeclaration({
            namedImports: [this._moduleClass],
            moduleSpecifier: `./modules/${this._moduleName}/${this._moduleName}`,
        });
        const registerFunction = modulesFile
            .getVariableDeclarationOrThrow('registerModules')
            .getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.ArrowFunction);
        registerFunction.setBodyText(`${registerFunction.getBodyText()} _app.registerModule(${this._moduleClass});`);
        modulesFile.organizeImports();
        await modulesFile.save();
    }
}
exports.default = ModuleGenerator;
//# sourceMappingURL=module_generator.js.map