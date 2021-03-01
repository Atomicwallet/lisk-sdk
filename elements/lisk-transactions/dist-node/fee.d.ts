interface BaseFee {
    readonly moduleID: number;
    readonly assetID: number;
    readonly baseFee: string;
}
interface Options {
    readonly minFeePerByte: number;
    readonly baseFees: BaseFee[];
    readonly numberOfSignatures: number;
}
export declare const computeMinFee: (assetSchema: object, trx: Record<string, unknown>, options?: Options | undefined) => bigint;
export {};
