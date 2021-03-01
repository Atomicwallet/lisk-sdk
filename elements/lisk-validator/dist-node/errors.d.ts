export interface ErrorObject {
    keyword: string;
    dataPath?: string;
    schemaPath?: string;
    params: ErrorParams;
    propertyName?: string;
    message?: string;
    schema?: never;
    parentSchema?: object;
    data?: never;
}
interface ErrorParams {
    [key: string]: unknown;
}
export declare class LiskValidationError extends Error {
    readonly errors: ErrorObject[];
    constructor(errors: ErrorObject[]);
    private _compileErrors;
}
export {};
