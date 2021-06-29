interface PassphraseError {
    readonly actual: number | boolean | string;
    readonly code: string;
    readonly expected: number | boolean | string;
    readonly location?: ReadonlyArray<number>;
    readonly message: string;
}
export declare const countPassphraseWhitespaces: (passphrase: string) => number;
export declare const countPassphraseWords: (passphrase: string) => number;
export declare const countUppercaseCharacters: (passphrase: string) => number;
export declare const locateUppercaseCharacters: (passphrase: string) => ReadonlyArray<number>;
export declare const locateConsecutiveWhitespaces: (passphrase: string) => ReadonlyArray<number>;
export declare const getPassphraseValidationErrors: (passphrase: string, wordlists?: readonly string[] | undefined, expectedWords?: number) => ReadonlyArray<PassphraseError>;
export {};
