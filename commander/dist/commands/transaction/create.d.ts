import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class CreateCommand extends BaseCommand {
    static args: {
        name: string;
    }[];
    static description: string;
    static examples: string[];
    static flags: {
        type: flagParser.IOptionFlag<string>;
        passphrase: flagParser.IOptionFlag<string>;
        'second-passphrase': flagParser.IOptionFlag<string>;
        'no-signature': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        votes: flagParser.IOptionFlag<string>;
        unvotes: flagParser.IOptionFlag<string>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
