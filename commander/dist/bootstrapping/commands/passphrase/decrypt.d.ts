import Command from '@oclif/command';
export declare class DecryptCommand extends Command {
    static args: {
        name: string;
        description: string;
        required: boolean;
    }[];
    static description: string;
    static examples: string[];
    static flags: {
        password: import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
    printJSON(message?: object, pretty?: boolean): void;
}
