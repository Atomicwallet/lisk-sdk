import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class ForgingCommand extends BaseCommand {
    static args: ({
        name: string;
        options: string[];
        description: string;
        required: boolean;
    } | {
        name: string;
        description: string;
        required: boolean;
        options?: undefined;
    })[];
    static description: string;
    static examples: string[];
    static flags: {
        password: flagParser.IOptionFlag<string>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
