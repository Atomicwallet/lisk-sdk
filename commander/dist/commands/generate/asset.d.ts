import BaseBootstrapCommand from '../../base_bootstrap_command';
export default class AssetCommand extends BaseBootstrapCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    run(): Promise<void>;
}
