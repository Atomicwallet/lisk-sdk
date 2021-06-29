/// <reference types="node" />
export declare const BIG_ENDIAN = "big";
export declare const LITTLE_ENDIAN = "little";
export declare const intToBuffer: (value: number | string, byteLength: number, endianness?: string, signed?: boolean) => Buffer;
export declare const bufferToHex: (buffer: Buffer) => string;
export declare const hexToBuffer: (hex: string, argumentName?: string) => Buffer;
export declare const stringToBuffer: (str: string) => Buffer;
