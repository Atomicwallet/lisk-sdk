/// <reference types="node" />
import { dataStructures } from '@liskhq/lisk-utils';
import { BlockHeader, Account, BlockHeaderAsset, AccountDefaultProps } from '@liskhq/lisk-chain';
export declare class DataAccessMock<T1 = AccountDefaultProps, T2 = BlockHeaderAsset> {
    protected _blockHeaders: BlockHeader<T2>[];
    protected _accounts: dataStructures.BufferMap<Account<T1>>;
    protected _chainState: Record<string, Buffer>;
    constructor(opts?: {
        blockHeaders?: BlockHeader<T2>[];
        accounts?: Account<T1>[];
        chainState?: Record<string, Buffer>;
    });
    getChainState(key: string): Promise<Buffer | undefined>;
    getAccountByAddress<T3 = T1>(address: Buffer): Promise<Account<T3>>;
    getLastBlockHeader(): Promise<BlockHeader<T2>>;
}
