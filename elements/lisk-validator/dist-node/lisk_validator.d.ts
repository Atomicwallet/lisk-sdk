import Ajv, { AnySchema, ValidateFunction } from 'ajv';
import { LiskErrorObject } from './types';
export declare const liskSchemaIdentifier: string;
declare class LiskValidator {
    private readonly _validator;
    constructor();
    validate(schema: object, data: object): LiskErrorObject[];
    validateSchema(schema: AnySchema | boolean): ReadonlyArray<LiskErrorObject>;
    compile(schema: object | boolean): ValidateFunction;
    removeSchema(schemaKeyRef?: object | string | RegExp | boolean): Ajv;
}
export declare const validator: LiskValidator;
export {};
