export declare const metaSchema: {
    title: string;
    type: string;
    enum: string[];
};
declare type ValidateFunction = (data: string, dataPath?: string, parentData?: object, parentDataProperty?: string | number, rootData?: object) => boolean;
interface AjvContext {
    root: {
        schema: object;
    };
    schemaPath: string;
}
export declare const dataTypeKeyword: {
    compile: (value: string, parentSchema: object, it: Partial<AjvContext>) => ValidateFunction;
    errors: string;
    modifying: boolean;
    metaSchema: {
        title: string;
        type: string;
        enum: string[];
    };
};
export {};
