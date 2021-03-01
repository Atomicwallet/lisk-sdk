import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../base';
export default class NetworkIdentifierCommand extends BaseCommand {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    static flags: {
        'community-identifier': flagParser.IOptionFlag<string>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
