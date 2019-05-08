import childProcess from 'child_process';
export interface ExecResult {
    readonly stderr: string;
    readonly stdout: string;
}
export declare const exec: (command: string, options?: childProcess.ExecOptions) => Promise<ExecResult>;
