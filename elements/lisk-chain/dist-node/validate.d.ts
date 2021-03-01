/// <reference types="node" />
import { Schema } from '@liskhq/lisk-codec';
import { Slots } from './slots';
import { Block, GenesisBlock } from './types';
export declare const validateSignature: (publicKey: Buffer, dataWithoutSignature: Buffer, signature: Buffer, networkIdentifier: Buffer) => void;
export declare const validateReward: (block: Block<import("./types").BlockHeaderAsset>, maxReward: bigint) => void;
export declare const validateBlockProperties: (block: Block<import("./types").BlockHeaderAsset>, encodedPayload: Buffer, maxPayloadLength: number) => void;
export declare const validateBlockSlot: (block: Block<import("./types").BlockHeaderAsset>, lastBlock: Block<import("./types").BlockHeaderAsset>, slots: Slots) => void;
export declare const validateGenesisBlockHeader: (block: GenesisBlock<import("./types").AccountDefaultProps>, accountSchema: Schema) => void;
