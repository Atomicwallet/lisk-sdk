import { Command } from '@oclif/command';
export declare class HashCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        'data-path': import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
