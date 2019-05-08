import BaseCommand from '../../base';
export default class GetCommand extends BaseCommand {
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static description: string;
    static examples: string[];
    static flags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
