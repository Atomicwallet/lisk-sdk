import { BaseGeneratorOptions } from '../../types';
import BaseGenerator from './base_generator';
export default class PluginGenerator extends BaseGenerator {
    protected _liskPluginArgs: {
        alias: string;
    };
    constructor(args: string | string[], opts: {
        alias: string;
    } & BaseGeneratorOptions);
    initializing(): Promise<void>;
    writing(): void;
    end(): void;
}
