import BaseCommand from '../base';
export default class CopyrightCommand extends BaseCommand {
    static description: string;
    static examples: string[];
    static flags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
