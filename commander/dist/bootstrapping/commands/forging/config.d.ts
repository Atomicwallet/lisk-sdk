import { Command, flags as flagParser } from '@oclif/command';
export declare class ConfigCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        password: flagParser.IOptionFlag<string | undefined>;
        passphrase: flagParser.IOptionFlag<string | undefined>;
        count: import("@oclif/parser/lib/flags").IOptionFlag<number>;
        distance: import("@oclif/parser/lib/flags").IOptionFlag<number>;
        output: flagParser.IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
    printJSON(message?: object, pretty?: boolean): void;
}
