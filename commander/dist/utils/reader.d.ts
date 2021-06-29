import { Schema } from '@liskhq/lisk-codec';
interface Question {
    readonly [key: string]: unknown;
}
interface NestedAsset {
    [key: string]: Array<Record<string, unknown>>;
}
export declare const getPassphraseFromPrompt: (displayName?: string, shouldConfirm?: boolean) => Promise<string>;
export declare const getPasswordFromPrompt: (displayName?: string, shouldConfirm?: boolean) => Promise<string>;
export declare const isFileSource: (source?: string | undefined) => boolean;
export declare const readFileSource: (source?: string | undefined) => Promise<string>;
export declare const readStdIn: () => Promise<string[]>;
export declare const transformAsset: (schema: Schema, data: Record<string, string>) => Record<string, unknown>;
export declare const transformNestedAsset: (schema: Schema, data: Array<Record<string, string>>) => NestedAsset;
export declare const prepareQuestions: (schema: Schema) => Question[];
export declare const getAssetFromPrompt: (assetSchema: Schema, output?: {
    [key: string]: string;
}[]) => Promise<NestedAsset | Record<string, unknown>>;
export {};
