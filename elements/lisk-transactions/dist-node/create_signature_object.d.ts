import { TransactionJSON } from './transaction_types';
export interface SignatureObject {
    readonly publicKey: string;
    readonly signature: string;
    readonly transactionId: string;
}
export declare const createSignatureObject: (transaction: TransactionJSON, passphrase: string) => SignatureObject;
