import { BaseGeneratorOptions } from '../../types';
import BaseGenerator from './base_generator';
export default class InitPluginGenerator extends BaseGenerator {
    protected _liskInitPluginArgs: {
        alias: string;
    };
    protected _registry?: string;
    constructor(args: string | string[], opts: {
        alias: string;
    } & BaseGeneratorOptions);
    initializing(): Promise<void>;
    configuring(): void;
    writing(): void;
    install(): void;
    end(): void;
}
