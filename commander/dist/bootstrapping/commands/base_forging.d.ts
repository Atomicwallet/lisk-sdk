import { flags as flagParser } from '@oclif/command';
import { BaseIPCClientCommand } from './base_ipc_client';
export declare abstract class BaseForgingCommand extends BaseIPCClientCommand {
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static flags: {
        password: flagParser.IOptionFlag<string | undefined>;
        overwrite: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'data-path': flagParser.IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    protected forging: boolean;
    run(): Promise<void>;
}
