import { Command, flags as flagParser } from '@oclif/command';
export declare class EncryptCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        password: flagParser.IOptionFlag<string | undefined>;
        passphrase: flagParser.IOptionFlag<string | undefined>;
        'output-public-key': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
    printJSON(message?: object, pretty?: boolean): void;
}
