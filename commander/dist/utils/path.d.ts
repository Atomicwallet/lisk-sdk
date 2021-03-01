export declare const getDefaultPath: (name: string) => string;
export declare const getFullPath: (dataPath: string) => string;
export declare const splitPath: (dataPath: string) => {
    rootPath: string;
    label: string;
};
export declare const getNetworkConfigFilesPath: (dataPath: string, network: string, configDirIncluded?: boolean) => {
    genesisBlockFilePath: string;
    configFilePath: string;
};
export declare const getConfigDirs: (dataPath: string, configDirIncluded?: boolean) => string[];
export declare const removeConfigDir: (dataPath: string, network: string) => void;
export declare const ensureConfigDir: (dataPath: string, network: string) => void;
export declare const getBlockchainDBPath: (dataPath: string) => string;
export declare const getForgerDBPath: (dataPath: string) => string;
export declare const getPidPath: (dataPath: string) => string;
