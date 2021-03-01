import * as apiClient from '@liskhq/lisk-api-client';
import { Command } from '@oclif/command';
import { RegisteredSchema } from 'lisk-framework';
import { PromiseResolvedType } from '../../types';
interface BaseIPCClientFlags {
    readonly 'data-path'?: string;
    readonly pretty?: boolean;
}
export declare abstract class BaseIPCClientCommand extends Command {
    static flags: {
        'data-path': import("@oclif/command/lib/flags").IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    protected baseIPCClientFlags: BaseIPCClientFlags;
    protected _client: PromiseResolvedType<ReturnType<typeof apiClient.createIPCClient>> | undefined;
    protected _schema: RegisteredSchema;
    protected _dataPath: string;
    finally(): Promise<void>;
    init(): Promise<void>;
    printJSON(message?: Record<string, unknown>): void;
}
export {};
