/// <reference types="node" />
import { MultisignatureStatus } from '../base_transaction';
import { TransactionError } from '../errors';
import { Account } from '../transaction_types';
export declare const verifySenderPublicKey: (id: string, sender: Account, publicKey: string) => TransactionError | undefined;
export declare const verifySenderId: (id: string, sender: Account, address: string) => TransactionError | undefined;
export declare const verifyBalance: (id: string, account: Account, amount: any) => TransactionError | undefined;
export declare const verifyAmountBalance: (id: string, account: Account, amount: any, fee: any) => TransactionError | undefined;
export declare const verifySecondSignature: (id: string, sender: Account, signSignature: string | undefined, transactionBytes: Buffer) => TransactionError | undefined;
interface VerifyMultiSignatureResult {
    readonly status: MultisignatureStatus;
    readonly errors: ReadonlyArray<TransactionError>;
}
export declare const verifyMultiSignatures: (id: string, sender: Account, signatures: ReadonlyArray<string>, transactionBytes: Buffer) => VerifyMultiSignatureResult;
export {};
