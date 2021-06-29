import { flags as flagParser } from '@oclif/command';
import BaseBootstrapCommand from '../base_bootstrap_command';
export default class InitCommand extends BaseBootstrapCommand {
    static description: string;
    static examples: string[];
    static flags: {
        registry: flagParser.IOptionFlag<string | undefined>;
        template: flagParser.IOptionFlag<string | undefined>;
    };
    static args: {
        name: string;
        description: string;
        default: string;
    }[];
    run(): Promise<void>;
}
