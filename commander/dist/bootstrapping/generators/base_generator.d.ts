/// <reference path="../../../external_types/yeoman-generator/lib/actions/install.d.ts" />
import * as YeomanGenerator from 'yeoman-generator';
import * as Storage from 'yeoman-generator/lib/util/storage';
import { BaseGeneratorOptions, LiskTemplate } from '../../types';
export default abstract class BaseGenerator extends YeomanGenerator {
    protected readonly _liskTemplatePath: string;
    protected readonly _liskTemplateName: string;
    protected readonly _liskRC: Storage;
    protected readonly _commanderVersion: string;
    protected _liskTemplate: LiskTemplate;
    protected _registry?: string;
    constructor(args: string | string[], opts: BaseGeneratorOptions);
    protected _loadAndValidateTemplate(): Promise<void>;
}
