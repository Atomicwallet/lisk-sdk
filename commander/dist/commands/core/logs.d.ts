import BaseCommand from '../../base';
export default class LogsCommand extends BaseCommand {
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    static flags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    static description: string;
    static examples: string[];
    run(): Promise<void>;
}
