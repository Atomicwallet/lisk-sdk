import { Application, PartialApplicationConfig } from 'lisk-framework';
import { Command, flags as flagParser } from '@oclif/command';
export declare abstract class BaseGenesisBlockCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        output: flagParser.IOptionFlag<string>;
        accounts: import("@oclif/parser/lib/flags").IOptionFlag<number>;
        validators: import("@oclif/parser/lib/flags").IOptionFlag<number>;
        'token-distribution': import("@oclif/parser/lib/flags").IOptionFlag<number>;
        'validators-passphrase-encryption-iterations': import("@oclif/parser/lib/flags").IOptionFlag<number>;
        'validators-hash-onion-count': import("@oclif/parser/lib/flags").IOptionFlag<number>;
        'validators-hash-onion-distance': import("@oclif/parser/lib/flags").IOptionFlag<number>;
    };
    run(): Promise<void>;
    abstract getApplication(genesisBlock: Record<string, unknown>, config: PartialApplicationConfig): Application;
}
