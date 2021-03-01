import { Command, flags as flagParser } from '@oclif/command';
export declare class ResetCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        'data-path': flagParser.IOptionFlag<string | undefined>;
        yes: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
