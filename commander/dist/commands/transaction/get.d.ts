import { flags as flagParser } from '@oclif/command';
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
        state: flagParser.IOptionFlag<string>;
        'sender-id': flagParser.IOptionFlag<string>;
        limit: flagParser.IOptionFlag<string>;
        offset: flagParser.IOptionFlag<string>;
        sort: flagParser.IOptionFlag<string>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
