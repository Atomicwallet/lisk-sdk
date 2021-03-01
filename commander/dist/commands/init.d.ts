import BaseBootstrapCommand from '../base_bootstrap_command';
export default class InitCommand extends BaseBootstrapCommand {
    static description: string;
    static examples: string[];
    static flags: {
        template: import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
    };
    static args: {
        name: string;
        description: string;
        default: string;
    }[];
    run(): Promise<void>;
}
