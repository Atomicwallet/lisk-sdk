import { IteratableGenericObject, IteratorReturnValue, SchemaProps } from './types';
export declare const iterator: (this: IteratableGenericObject) => {
    next: () => {
        done: boolean;
        value: IteratorReturnValue;
    };
};
export declare const recursiveTypeCast: (mode: 'toJSON' | 'fromJSON', object: IteratableGenericObject, schema: SchemaProps, dataPath: string[]) => void;
