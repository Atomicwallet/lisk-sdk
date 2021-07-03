import { TransactionError } from '../errors';
export declare const validateSenderIdAndPublicKey: (id: string, senderId: string, senderPublicKey: string) => TransactionError | undefined;
