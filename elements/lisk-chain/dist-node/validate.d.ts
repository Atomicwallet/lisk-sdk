/// <reference types="node" />
import { Schema } from '@liskhq/lisk-codec';
import { Slots } from './slots';
import { Block, GenesisBlock } from './types';
export declare const validateSignature: (publicKey: Buffer, dataWithoutSignature: Buffer, signature: Buffer, networkIdentifier: Buffer) => void;
export declare const validateReward: (block: Block, maxReward: bigint) => void;
export declare const validateBlockProperties: (block: Block, encodedPayload: Buffer, maxPayloadLength: number) => void;
export declare const validateBlockSlot: (block: Block, lastBlock: Block, slots: Slots) => void;
export declare const validateGenesisBlockHeader: (block: GenesisBlock, accountSchema: Schema) => void;
