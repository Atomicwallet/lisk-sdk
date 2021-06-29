import * as Generator from 'yeoman-generator';
interface PluginPrompts {
    author: string;
    version: string;
    name: string;
}
interface PluginGeneratorOptions {
    alias: string;
}
export default class PluginGenerator extends Generator {
    protected _answers: PluginPrompts | undefined;
    protected _templatePath: string;
    protected _packageJSON: Record<string, unknown> | undefined;
    protected _className: string;
    protected _pluginFileName: string;
    protected _alias: string;
    constructor(args: string | string[], opts: PluginGeneratorOptions);
    prompting(): Promise<void>;
    writing(): void;
    registerPlugin(): Promise<void>;
}
export {};
