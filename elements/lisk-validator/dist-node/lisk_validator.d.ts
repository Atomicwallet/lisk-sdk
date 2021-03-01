import * as Ajv from 'ajv';
import { ValidateFunction } from 'ajv';
import { ErrorObject } from './errors';
export declare const liskSchemaIdentifier: string;
declare class LiskValidator {
    private readonly _validator;
    constructor();
    validate(schema: object, data: object): ErrorObject[];
    validateSchema(schema: object | boolean): ReadonlyArray<ErrorObject>;
    compile(schema: object | boolean): ValidateFunction;
    removeSchema(schemaKeyRef?: object | string | RegExp | boolean): Ajv.Ajv;
}
export declare const validator: LiskValidator;
export {};
