import { Command, flags as flagParser } from '@oclif/command';
interface BootstrapFlags {
    readonly template?: string;
}
export default abstract class BaseBootstrapCommand extends Command {
    static flags: {
        template: flagParser.IOptionFlag<string | undefined>;
    };
    bootstrapFlags: BootstrapFlags;
    finally(error?: Error | string): Promise<void>;
    init(): Promise<void>;
    protected _isLiskAppDir(path: string): boolean;
    protected _runBootstrapCommand(command: string, opts?: Record<string, unknown>): Promise<void>;
}
export {};
