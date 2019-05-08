export declare type WritableValue = string | ReadonlyArray<string> | boolean | number | object;
interface ConfigOptionsIndex {
    [key: string]: WritableValue;
}
interface ConfigObject {
    readonly api: {
        readonly network: string;
        readonly nodes: ReadonlyArray<string>;
    };
    readonly json: boolean;
    readonly pretty: boolean;
}
export declare type ConfigOptions = ConfigOptionsIndex & ConfigObject;
export declare const setConfig: (configDirPath: string, newConfig: object) => boolean;
export declare const getConfig: (configDirPath: string) => ConfigOptions;
export {};
