import BaseCommand from '../../base';
export default class BroadcastCommand extends BaseCommand {
    static args: {
        name: string;
        description: string;
    }[];
    static description: string;
    static examples: string[];
    static lags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
