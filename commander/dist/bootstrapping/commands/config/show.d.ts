import { Command } from '@oclif/command';
export declare class ShowCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        'data-path': import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        config: import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
