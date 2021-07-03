import * as BN from '@liskhq/bignum';
import { MultisignatureStatus } from '../base_transaction';
import { TransactionError } from '../errors';
import { Account } from '../transaction_types';
export declare const verifySenderPublicKey: (id: string, sender: Account, publicKey: string) => TransactionError;
export declare const verifySenderId: (id: string, sender: Account, address: string) => TransactionError;
export declare const verifyBalance: (id: string, account: Account, amount: BN) => TransactionError;
export declare const verifyAmountBalance: (id: string, account: Account, amount: BN, fee: BN) => TransactionError;
export declare const verifySecondSignature: (id: string, sender: Account, signSignature: string, transactionBytes: Buffer) => TransactionError;
interface VerifyMultiSignatureResult {
    readonly status: MultisignatureStatus;
    readonly errors: ReadonlyArray<TransactionError>;
}
export declare const verifyMultiSignatures: (id: string, sender: Account, signatures: ReadonlyArray<string>, transactionBytes: Buffer) => VerifyMultiSignatureResult;
export {};
