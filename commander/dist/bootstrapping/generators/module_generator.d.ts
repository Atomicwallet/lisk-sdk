import { BaseGeneratorOptions } from '../../types';
import BaseGenerator from './base_generator';
interface ModuleGeneratorOptions extends BaseGeneratorOptions {
    moduleName: string;
    moduleID: string;
}
export default class ModuleGenerator extends BaseGenerator {
    protected _liskModuleArgs: {
        moduleName: string;
        moduleID: string;
    };
    constructor(args: string | string[], opts: ModuleGeneratorOptions);
    initializing(): Promise<void>;
    writing(): void;
    end(): void;
}
export {};
