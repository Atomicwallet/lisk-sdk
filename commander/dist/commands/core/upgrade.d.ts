import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class UpgradeCommand extends BaseCommand {
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    static description: string;
    static examples: string[];
    static flags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'lisk-version': flagParser.IOptionFlag<string>;
        'release-url': flagParser.IOptionFlag<string>;
    };
    run(): Promise<void>;
}
