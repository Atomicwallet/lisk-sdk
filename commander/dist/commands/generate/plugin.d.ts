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
        template: import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
