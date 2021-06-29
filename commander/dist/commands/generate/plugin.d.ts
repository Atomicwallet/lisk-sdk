import { flags as flagParser } from '@oclif/command';
import BaseBootstrapCommand from '../../base_bootstrap_command';
export default class PluginCommand extends BaseBootstrapCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    static flags: {
        standalone: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        output: flagParser.IOptionFlag<string | undefined>;
        registry: flagParser.IOptionFlag<string | undefined>;
        template: flagParser.IOptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
