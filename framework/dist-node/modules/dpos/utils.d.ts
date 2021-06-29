/// <reference types="node" />
import { Account } from '@liskhq/lisk-chain';
import { DPOSAccountProps, UnlockingAccountAsset } from './types';
export declare const sortUnlocking: (unlocks: UnlockingAccountAsset[]) => void;
export declare const getMinPunishedHeight: (sender: Account<DPOSAccountProps>, delegate: Account<DPOSAccountProps>) => number;
export declare const getPunishmentPeriod: (sender: Account<DPOSAccountProps>, delegateAccount: Account<DPOSAccountProps>, lastBlockHeight: number) => number;
export declare const getMinWaitingHeight: (senderAddress: Buffer, delegateAddress: Buffer, unlockObject: UnlockingAccountAsset) => number;
export declare const getWaitingPeriod: (senderAddress: Buffer, delegateAddress: Buffer, lastBlockHeight: number, unlockObject: UnlockingAccountAsset) => number;
export declare const isNullCharacterIncluded: (input: string) => boolean;
export declare const isUsername: (username: string) => boolean;
export declare const validateSignature: (tag: string, networkIdentifier: Buffer, publicKey: Buffer, signature: Buffer, bytes: Buffer) => boolean;
export declare const isCurrentlyPunished: (height: number, pomHeights: ReadonlyArray<number>) => boolean;
