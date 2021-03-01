export declare const metaSchema: {
    title: string;
    type: string;
    minimum: number;
    maximum: number;
};
declare type ValidateFunction = (data: string, dataPath?: string, parentData?: object, parentDataProperty?: string | number, rootData?: object) => boolean;
interface AjvContext {
    root: {
        schema: object;
    };
    schemaPath: string;
}
export declare const fieldNumberKeyword: {
    compile: (value: number, parentSchema: object, it: Partial<AjvContext>) => ValidateFunction;
    valid: boolean;
    errors: boolean;
    modifying: boolean;
    metaSchema: {
        title: string;
        type: string;
        minimum: number;
        maximum: number;
    };
};
export {};
