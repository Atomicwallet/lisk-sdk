import { Command, flags as flagParser } from '@oclif/command';
export declare class CreateCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        output: flagParser.IOptionFlag<string>;
        label: flagParser.IOptionFlag<string>;
        'community-identifier': flagParser.IOptionFlag<string>;
    };
    run(): Promise<void>;
}
