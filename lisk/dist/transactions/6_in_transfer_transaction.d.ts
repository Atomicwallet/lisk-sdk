import {
	BaseTransaction,
	StateStore,
	StateStorePrepare,
	TransactionError,
	TransactionJSON,
} from '@liskhq/lisk-transactions';
export interface InTransferAsset {
	readonly inTransfer: {
		readonly dappId: string;
	};
}
export declare const inTransferAssetFormatSchema: {
	type: string;
	required: string[];
	properties: {
		inTransfer: {
			type: string;
			required: string[];
			properties: {
				dappId: {
					type: string;
					format: string;
				};
			};
		};
	};
};
export declare class InTransferTransaction extends BaseTransaction {
	readonly asset: InTransferAsset;
	constructor(rawTransaction: unknown);
	protected assetToBytes(): Buffer;
	prepare(store: StateStorePrepare): Promise<void>;
	assetToJSON(): object;
	protected verifyAgainstTransactions(
		_: ReadonlyArray<TransactionJSON>
	): ReadonlyArray<TransactionError>;
	protected validateAsset(): ReadonlyArray<TransactionError>;
	protected applyAsset(store: StateStore): ReadonlyArray<TransactionError>;
	protected undoAsset(store: StateStore): ReadonlyArray<TransactionError>;
}
