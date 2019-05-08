import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class InstallCommand extends BaseCommand {
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
        'installation-path': flagParser.IOptionFlag<string>;
        'lisk-version': flagParser.IOptionFlag<string>;
        'no-snapshot': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'no-start': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        network: flagParser.IOptionFlag<string>;
        'release-url': flagParser.IOptionFlag<string>;
        'snapshot-url': flagParser.IOptionFlag<string>;
    };
    run(): Promise<void>;
}
