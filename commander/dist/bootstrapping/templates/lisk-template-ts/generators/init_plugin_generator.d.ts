import * as Generator from 'yeoman-generator';
interface InitPluginPrompts {
    author: string;
    version: string;
    name: string;
    description: string;
    license: string;
}
interface InitPluginGeneratorOptions {
    alias: string;
}
export default class InitPluginGenerator extends Generator {
    protected _answers: InitPluginPrompts | undefined;
    protected _templatePath: string;
    protected _className: string;
    protected _alias: string;
    constructor(args: string | string[], opts: InitPluginGeneratorOptions);
    prompting(): Promise<void>;
    createSkeleton(): void;
}
export {};
