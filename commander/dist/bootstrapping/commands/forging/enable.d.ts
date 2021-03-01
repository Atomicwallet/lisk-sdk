import { BaseForgingCommand } from '../base_forging';
export declare abstract class EnableCommand extends BaseForgingCommand {
    static description: string;
    static examples: string[];
    static flags: {
        password: import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        overwrite: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'data-path': import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    init(): Promise<void>;
}
