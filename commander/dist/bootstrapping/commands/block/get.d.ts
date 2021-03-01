import { BaseIPCClientCommand } from '../base_ipc_client';
export declare abstract class GetCommand extends BaseIPCClientCommand {
    static description: string;
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static examples: string[];
    static flags: {
        'data-path': import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
