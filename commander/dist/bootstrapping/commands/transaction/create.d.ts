import * as apiClient from '@liskhq/lisk-api-client';
import Command, { flags as flagParser } from '@oclif/command';
import { Application, PartialApplicationConfig, RegisteredSchema } from 'lisk-framework';
import { PromiseResolvedType } from '../../../types';
export declare abstract class CreateCommand extends Command {
    static strict: boolean;
    static description: string;
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static examples: string[];
    static flags: {
        passphrase: flagParser.IOptionFlag<string | undefined>;
        asset: flagParser.IOptionFlag<string | undefined>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        offline: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'no-signature': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'network-identifier': flagParser.IOptionFlag<string | undefined>;
        nonce: flagParser.IOptionFlag<string | undefined>;
        'sender-public-key': flagParser.IOptionFlag<string | undefined>;
        'data-path': flagParser.IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    protected _client: PromiseResolvedType<ReturnType<typeof apiClient.createIPCClient>> | undefined;
    protected _schema: RegisteredSchema;
    protected _dataPath: string;
    run(): Promise<void>;
    printJSON(pretty: boolean, message?: Record<string, unknown>): void;
    finally(): Promise<void>;
    abstract getApplication(genesisBlock: Record<string, unknown>, config: PartialApplicationConfig): Application;
}
