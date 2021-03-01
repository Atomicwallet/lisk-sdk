import BaseBootstrapCommand from '../../base_bootstrap_command';
export default class ModuleCommand extends BaseBootstrapCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    run(): Promise<void>;
}
