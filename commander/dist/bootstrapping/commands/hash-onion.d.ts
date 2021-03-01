import Command, { flags as flagParser } from '@oclif/command';
export declare class HashOnionCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        output: flagParser.IOptionFlag<string | undefined>;
        count: import("@oclif/parser/lib/flags").IOptionFlag<number>;
        distance: import("@oclif/parser/lib/flags").IOptionFlag<number>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
    printJSON(message?: object, pretty?: boolean): void;
}
