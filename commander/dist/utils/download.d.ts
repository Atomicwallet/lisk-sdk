export declare const download: (url: string, cacheDir: string) => Promise<void>;
export declare const validateChecksum: (
	url: string,
	cacheDir: string,
) => Promise<void>;
export declare const extract: (
	filePath: string,
	fileName: string,
	outDir: string,
) => Promise<string>;
export declare const downloadAndValidate: (
	url: string,
	cacheDir: string,
) => Promise<void>;
