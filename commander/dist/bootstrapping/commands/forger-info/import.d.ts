import { Command, flags as flagParser } from '@oclif/command';
export declare abstract class ImportCommand extends Command {
    static description: string;
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static examples: string[];
    static flags: {
        'data-path': flagParser.IOptionFlag<string | undefined>;
        force: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
