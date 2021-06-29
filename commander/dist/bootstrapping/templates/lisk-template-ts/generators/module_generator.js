"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ts_morph_1 = require("ts-morph");
const Generator = require("yeoman-generator");
const convert_1 = require("../../../../utils/convert");
class ModuleGenerator extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this._templatePath = path_1.join(__dirname, '..', 'templates', 'module');
        this._moduleName = this.options.moduleName;
        this._moduleFileName = convert_1.camelToSnake(this._moduleName);
        this._moduleID = this.options.moduleID;
        this._moduleClass = `${convert_1.camelToPascal(this._moduleName)}Module`;
    }
    writing() {
        this.fs.copyTpl(`${this._templatePath}/src/app/modules/module.ts`, this.destinationPath(`src/app/modules/${this._moduleFileName}/${this._moduleFileName}_module.ts`), {
            moduleName: this._moduleName,
            moduleID: this._moduleID,
            moduleClass: this._moduleClass,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
        this.fs.copyTpl(`${this._templatePath}/test/unit/modules/module.spec.ts`, this.destinationPath(`test/unit/modules/${this._moduleFileName}/${this._moduleFileName}_module.spec.ts`), {
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
            moduleSpecifier: `./modules/${this._moduleFileName}/${this._moduleFileName}_module`,
        });
        const registerFunction = modulesFile
            .getVariableDeclarationOrThrow('registerModules')
            .getInitializerIfKindOrThrow(ts_morph_1.SyntaxKind.ArrowFunction);
        registerFunction.setBodyText(`${registerFunction.getBodyText()}\napp.registerModule(${this._moduleClass});`);
        modulesFile.organizeImports();
        await modulesFile.save();
    }
}
exports.default = ModuleGenerator;
//# sourceMappingURL=module_generator.js.map