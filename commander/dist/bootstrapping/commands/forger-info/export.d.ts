import { Command } from '@oclif/command';
export declare abstract class ExportCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        'data-path': import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        output: import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
