import { FrameworkError } from '../../errors';
export declare class InvalidNonceError extends FrameworkError {
    code: string;
    actual: string;
    expected: string;
    constructor(message: string, actual: bigint, expected: bigint);
}
