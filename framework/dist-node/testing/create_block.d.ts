/// <reference types="node" />
import { Block, BlockHeader, BlockHeaderAsset, Transaction } from '@liskhq/lisk-chain';
interface CreateBlock<T = BlockHeaderAsset> {
    passphrase: string;
    networkIdentifier: Buffer;
    timestamp: number;
    previousBlockID: Buffer;
    payload?: Transaction[];
    header?: Partial<BlockHeader<T>>;
}
export declare const encodeBlockHeader: (header: BlockHeader, skipSignature?: boolean) => Buffer;
export declare const createBlockHeaderWithDefaults: <T = unknown>(header?: Partial<BlockHeader<T>> | undefined) => Partial<BlockHeader<T>>;
export declare const createFakeBlockHeader: <T = unknown>(header?: Partial<BlockHeader<T>> | undefined) => BlockHeader<T>;
export declare const createBlock: <T = BlockHeaderAsset>({ passphrase, networkIdentifier, timestamp, previousBlockID, payload, header, }: CreateBlock<T>) => Block<T>;
export {};
