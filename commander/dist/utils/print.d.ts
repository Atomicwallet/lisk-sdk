export interface StringMap {
    readonly [key: string]: string;
}
interface PrintInput {
    readonly json?: boolean;
    readonly pretty?: boolean;
}
interface Printer {
    log(message?: string, ...args: Array<unknown>): void;
}
export declare const print: ({ json, pretty }?: PrintInput) => (this: Printer, result: StringMap | ReadonlyArray<StringMap>) => void;
export {};
