import { ErrorObject } from 'ajv';
export { DataValidateFunction, DataValidationCxt } from 'ajv/dist/types';
export interface LiskErrorObject extends Omit<ErrorObject, 'instancePath' | 'schemaPath'> {
    dataPath?: string;
    schemaPath?: string;
}
