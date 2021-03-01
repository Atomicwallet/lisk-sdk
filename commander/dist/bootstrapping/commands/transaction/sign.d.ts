import Command, { flags as flagParser } from '@oclif/command';
import * as apiClient from '@liskhq/lisk-api-client';
import { Application, PartialApplicationConfig, RegisteredSchema } from 'lisk-framework';
import { PromiseResolvedType } from '../../../types';
export declare abstract class SignCommand extends Command {
    static description: string;
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    static flags: {
        passphrase: flagParser.IOptionFlag<string | undefined>;
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        offline: {
            dependsOn: string[];
            exclusive: string[];
            name: string;
            char?: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | undefined;
            description?: string | undefined;
            helpLabel?: string | undefined;
            hidden?: boolean | undefined;
            required?: boolean | undefined;
            env?: string | undefined;
            parse(input: boolean, context: any): boolean;
            type: "boolean";
            allowNo: boolean;
            default?: boolean | ((context: import("@oclif/parser/lib/flags").DefaultContext<boolean>) => boolean) | undefined;
        };
        'include-sender': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'mandatory-keys': flagParser.IOptionFlag<string[]>;
        'optional-keys': flagParser.IOptionFlag<string[]>;
        'network-identifier': flagParser.IOptionFlag<string | undefined>;
        'sender-public-key': flagParser.IOptionFlag<string | undefined>;
        'data-path': flagParser.IOptionFlag<string | undefined>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    static examples: string[];
    protected _client: PromiseResolvedType<ReturnType<typeof apiClient.createIPCClient>> | undefined;
    protected _schema: RegisteredSchema;
    protected _dataPath: string;
    run(): Promise<void>;
    printJSON(pretty: boolean, message?: Record<string, unknown>): void;
    finally(error?: Error | string): Promise<void>;
    abstract getApplication(genesisBlock: Record<string, unknown>, config: PartialApplicationConfig): Application;
}
