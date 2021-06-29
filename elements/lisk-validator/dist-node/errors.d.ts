import { LiskErrorObject } from './types';
export declare const convertErrorsToLegacyFormat: (errors: LiskErrorObject[]) => LiskErrorObject[];
export declare class LiskValidationError extends Error {
    readonly errors: LiskErrorObject[];
    constructor(errors: LiskErrorObject[]);
    private _compileErrors;
}
