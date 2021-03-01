import { Command } from '@oclif/command';
export declare const defaultConfigFolder = ".lisk";
interface PrintFlags {
    readonly json?: boolean;
    readonly pretty?: boolean;
}
export default abstract class BaseCommand extends Command {
    static flags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    printFlags: PrintFlags;
    finally(error?: Error | string): Promise<void>;
    init(): Promise<void>;
    print(result: unknown): void;
}
export {};
