import BaseCommand from '../../base';
export default class GetCommand extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {
        'forging-status': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
