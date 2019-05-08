import {
	BaseTransaction,
	StateStore,
	StateStorePrepare,
	TransactionError,
	TransactionJSON,
} from '@liskhq/lisk-transactions';
export interface OutTransferAsset {
	readonly outTransfer: {
		readonly dappId: string;
		readonly transactionId: string;
	};
}
export declare const outTransferAssetFormatSchema: {
	type: string;
	required: string[];
	properties: {
		outTransfer: {
			type: string;
			required: string[];
			properties: {
				dappId: {
					type: string;
					format: string;
				};
				transactionId: {
					type: string;
					format: string;
				};
			};
		};
	};
};
export declare class OutTransferTransaction extends BaseTransaction {
	readonly asset: OutTransferAsset;
	readonly containsUniqueData: boolean;
	constructor(rawTransaction: unknown);
	prepare(store: StateStorePrepare): Promise<void>;
	protected assetToBytes(): Buffer;
	assetToJSON(): object;
	protected verifyAgainstTransactions(
		transactions: ReadonlyArray<TransactionJSON>
	): ReadonlyArray<TransactionError>;
	protected validateAsset(): ReadonlyArray<TransactionError>;
	protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
	undoAsset(store: StateStore): ReadonlyArray<TransactionError>;
}
