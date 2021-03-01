/// <reference types="node" />
export declare type BaseTypes = string | number | Buffer | bigint | boolean;
export interface GenericObject {
    [key: string]: GenericObject | BaseTypes | Array<BaseTypes | GenericObject>;
}
export interface SchemaPair {
    readonly [key: string]: SchemaProps;
}
export interface Schema {
    readonly $id: string;
    readonly type: string;
    readonly properties: Record<string, unknown>;
    readonly required?: string[];
}
export interface ValidatedSchema {
    readonly $id: string;
    readonly $schema: string;
    readonly type: string;
    readonly required?: string[];
    properties: SchemaPair;
}
export interface SchemaProps {
    readonly fieldNumber: number;
    readonly type?: string;
    readonly dataType?: string;
    readonly properties?: SchemaPair;
    readonly items?: SchemaObjectItem | SchemaScalarItem;
}
export interface SchemaObjectItem {
    readonly type: 'object';
    readonly fieldNumber: number;
    readonly properties: SchemaPair;
}
export interface SchemaScalarItem {
    readonly dataType: string;
    readonly type?: undefined;
}
export interface CompiledSchema {
    schemaProp: SchemaProps;
    propertyName: string;
    binaryKey: Buffer;
    dataPath: string[];
}
export declare type CompiledSchemasArray = Array<CompiledSchema | CompiledSchema[]>;
export interface CompiledSchemas {
    [key: string]: CompiledSchemasArray;
}
export interface Validator {
    addMetaSchema: (schema: Record<string, unknown>, key?: string) => void;
}
export interface IteratorReturnValue {
    value: any;
    key: string;
}
export interface IteratableGenericObject extends GenericObject {
    [Symbol.iterator](): Iterator<IteratorReturnValue>;
}
