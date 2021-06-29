import { Block } from '@liskhq/lisk-chain';
export declare const getTotalFees: (block: Block, minFeePerByte: bigint, baseFees: ReadonlyArray<{
    assetID: number;
    baseFee: string;
    moduleID: number;
}>) => {
    readonly totalFee: bigint;
    readonly totalMinFee: bigint;
};
