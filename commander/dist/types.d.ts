import { GeneratorConstructor, GeneratorOptions } from 'yeoman-generator';
export interface BaseGeneratorOptions extends GeneratorOptions {
    template: string;
    version: string;
    projectPath?: string;
    registry?: string;
}
export interface LiskTemplate {
    generators: {
        init: GeneratorConstructor;
        initPlugin: GeneratorConstructor;
        module: GeneratorConstructor;
        asset: GeneratorConstructor;
        plugin: GeneratorConstructor;
    };
}
export declare type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;
export interface Schema {
    readonly $id: string;
    readonly type: string;
    readonly properties: Record<string, unknown>;
}
export declare type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
