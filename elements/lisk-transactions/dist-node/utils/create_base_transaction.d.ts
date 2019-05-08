export interface CreateBaseTransactionInput {
    readonly passphrase?: string;
    readonly secondPassphrase?: string;
    readonly timeOffset?: number;
}
export declare const createBaseTransaction: ({ passphrase, timeOffset, }: CreateBaseTransactionInput) => {
    amount: string;
    recipientId: string;
    senderId: string;
    senderPublicKey: string;
    timestamp: number;
};
