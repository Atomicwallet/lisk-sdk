import { Command, flags as flagParser } from '@oclif/command';
import { Application, PartialApplicationConfig } from 'lisk-framework';
export declare abstract class StartCommand extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        'data-path': flagParser.IOptionFlag<string | undefined>;
        network: flagParser.IOptionFlag<string>;
        config: flagParser.IOptionFlag<string | undefined>;
        'overwrite-config': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        port: import("@oclif/parser/lib/flags").IOptionFlag<number | undefined>;
        'api-ipc': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'api-ws': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'api-ws-port': import("@oclif/parser/lib/flags").IOptionFlag<number | undefined>;
        'console-log': flagParser.IOptionFlag<string | undefined>;
        log: flagParser.IOptionFlag<string | undefined>;
        'seed-peers': flagParser.IOptionFlag<string | undefined>;
    };
    run(): Promise<void>;
    abstract getApplication(genesisBlock: Record<string, unknown>, config: PartialApplicationConfig): Application;
    abstract getApplicationConfigDir(): string;
}
