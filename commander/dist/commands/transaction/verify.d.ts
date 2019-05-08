import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class VerifyCommand extends BaseCommand {
    static args: {
        name: string;
        description: string;
    }[];
    static description: string;
    static examples: string[];
    static flags: {
        'second-public-key': flagParser.IOptionFlag<string>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
