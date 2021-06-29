export interface StringMap {
    readonly [key: string]: string;
}
interface PrintInput {
    readonly json?: boolean;
    readonly pretty?: boolean;
}
interface Printer {
    log: (message?: string, ...args: unknown[]) => void;
}
export declare const print: ({ json, pretty }?: PrintInput) => (this: Printer, result: ReadonlyArray<StringMap> | StringMap) => void;
export {};
