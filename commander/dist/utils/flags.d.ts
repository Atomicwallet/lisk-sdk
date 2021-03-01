import { flags as flagParser } from '@oclif/command';
export declare type AlphabetLowercase = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
export interface FlagMap {
    readonly [key: string]: {
        readonly char?: AlphabetLowercase;
        readonly description: string;
    };
}
export declare const flags: FlagMap;
export declare const flagsWithParser: {
    dataPath: flagParser.IOptionFlag<string | undefined>;
    network: flagParser.IOptionFlag<string>;
    config: flagParser.IOptionFlag<string | undefined>;
    pretty: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    passphrase: flagParser.IOptionFlag<string | undefined>;
    output: flagParser.IOptionFlag<string | undefined>;
    password: flagParser.IOptionFlag<string | undefined>;
    offline: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    senderPublicKey: flagParser.IOptionFlag<string | undefined>;
    networkIdentifier: flagParser.IOptionFlag<string | undefined>;
};
