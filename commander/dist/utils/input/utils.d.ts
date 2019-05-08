interface SplitSource {
    readonly sourceIdentifier: string;
    readonly sourceType: string;
}
export declare const splitSource: (source: string) => SplitSource;
interface GetStdInInputs {
    readonly dataIsRequired?: boolean;
    readonly passphraseIsRequired?: boolean;
    readonly passwordIsRequired?: boolean;
    readonly secondPassphraseIsRequired?: boolean;
}
interface GetStdInOutput {
    readonly data?: string;
    readonly passphrase?: string;
    readonly password?: string;
    readonly secondPassphrase?: string;
}
export declare const getStdIn: ({ passphraseIsRequired, secondPassphraseIsRequired, passwordIsRequired, dataIsRequired, }?: GetStdInInputs) => Promise<GetStdInOutput>;
interface GetPassphraseFromPromptInputs {
    readonly displayName: string;
    readonly shouldRepeat?: boolean;
}
export declare const getPassphraseFromPrompt: ({ displayName, shouldRepeat, }: GetPassphraseFromPromptInputs) => Promise<string>;
export declare const getPassphraseFromEnvVariable: (key: string, displayName: string) => Promise<string>;
export declare const getPassphraseFromFile: (path: string) => Promise<string>;
export declare const getPassphraseFromSource: (source: string, { displayName }: {
    readonly displayName: string;
}) => Promise<string>;
export declare const getPassphrase: (passphraseSource: string, options: object) => Promise<string>;
export declare const handleReadFileErrors: (path: string) => (error: Error) => never;
export declare const getDataFromFile: (path: string) => Promise<string>;
export declare const getData: (source?: string) => Promise<string>;
export {};
