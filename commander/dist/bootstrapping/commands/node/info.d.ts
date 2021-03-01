import { BaseIPCClientCommand } from '../base_ipc_client';
export declare abstract class InfoCommand extends BaseIPCClientCommand {
    static description: string;
    static examples: string[];
    static flags: {
        'data-path': import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
