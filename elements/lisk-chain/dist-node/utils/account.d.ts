import { Schema } from '@liskhq/lisk-codec';
import { AccountSchema } from '../types';
export declare type SchemaWithDefault = Schema & {
    default: Record<string, unknown>;
};
export declare const getAccountSchemaWithDefault: (accountSchemas: {
    [moduleName: string]: AccountSchema;
}) => SchemaWithDefault;
