import * as Generator from 'yeoman-generator';
interface ModuleGeneratorOptions extends Generator.GeneratorOptions {
    moduleName: string;
    moduleID: string;
}
export default class ModuleGenerator extends Generator {
    protected _moduleName: string;
    protected _moduleClass: string;
    protected _moduleFileName: string;
    protected _moduleID: string;
    protected _templatePath: string;
    constructor(args: string | string[], opts: ModuleGeneratorOptions);
    writing(): void;
    registerModule(): Promise<void>;
}
export {};
