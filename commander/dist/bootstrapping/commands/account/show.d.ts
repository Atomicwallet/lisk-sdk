import { Command } from '@oclif/command';
export declare class ShowCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        passphrase: import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
    };
    run(): Promise<void>;
}
