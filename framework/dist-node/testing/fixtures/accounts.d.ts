/// <reference types="node" />
import { Account, AccountDefaultProps } from '@liskhq/lisk-chain';
import { ModuleClass, PartialAccount } from '../types';
export declare const defaultFaucetAccount: {
    address: Buffer;
    publicKey: Buffer;
    passphrase: string;
    balance: string;
    encryptedPassphrase: string;
    password: string;
};
export declare const defaultAccounts: <T>() => PartialAccount<T>[];
export declare const createDefaultAccount: <T = AccountDefaultProps>(modules?: ModuleClass[], data?: Record<string, unknown>) => Account<T>;
