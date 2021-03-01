import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class EncryptCommand extends BaseCommand {
    static args: ({
        name: string;
        description: string;
        required: boolean;
    } | {
        name: string;
        description: string;
        required?: undefined;
    })[];
    static description: string;
    static examples: string[];
    static flags: {
        passphrase: flagParser.IOptionFlag<string | undefined>;
        message: flagParser.IOptionFlag<string | undefined>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
