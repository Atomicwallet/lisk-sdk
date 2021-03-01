import { Block } from '@liskhq/lisk-chain';
export declare const getTotalFees: (block: Block<import("@liskhq/lisk-chain/dist-node/types").BlockHeaderAsset>, minFeePerByte: bigint, baseFees: readonly {
    assetID: number;
    baseFee: string;
    moduleID: number;
}[]) => {
    readonly totalFee: bigint;
    readonly totalMinFee: bigint;
};
