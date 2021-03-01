/// <reference types="node" />
import { BlockHeader } from '../../types';
import { Base } from './base';
export declare class BlockCache extends Base<BlockHeader> {
    add(blockHeader: BlockHeader): BlockHeader[];
    refill(blockHeaders: BlockHeader[]): BlockHeader[];
    remove(id: Buffer): BlockHeader[];
    getByID(id: Buffer): BlockHeader | undefined;
    getByIDs(ids: ReadonlyArray<Buffer>): BlockHeader[];
    getByHeight(height: number): BlockHeader | undefined;
    getByHeights(heightList: ReadonlyArray<number>): BlockHeader[];
    getByHeightBetween(fromHeight: number, toHeight: number): BlockHeader[];
}
