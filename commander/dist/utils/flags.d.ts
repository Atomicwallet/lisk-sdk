export declare type AlphabetLowercase = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
export interface FlagMap {
    readonly [key: string]: {
        readonly char?: AlphabetLowercase;
        readonly description: string;
    };
}
export declare const flags: FlagMap;
