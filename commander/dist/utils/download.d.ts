export interface FileInfo {
    readonly fileName: string;
    readonly fileDir: string;
    readonly filePath: string;
}
export declare const getDownloadedFileInfo: (url: string, downloadDir: string) => FileInfo;
export declare const download: (url: string, dir: string) => Promise<void>;
export declare const verifyChecksum: (filePath: string, expectedChecksum: string) => Promise<void>;
export declare const getChecksum: (url: string, dir: string) => string;
export declare const downloadAndValidate: (url: string, dir: string) => Promise<void>;
export declare const extract: (filePath: string, fileName: string, outDir: string) => Promise<void>;
