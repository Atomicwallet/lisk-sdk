import { TransferAsset } from '../0_transfer_transaction';
import { SecondSignatureAsset } from '../1_second_signature_transaction';
import { DelegateAsset } from '../2_delegate_transaction';
import { VoteAsset } from '../3_vote_transaction';
import { MultiSignatureAsset } from '../4_multisignature_transaction';
import { DappAsset } from '../5_dapp_transaction';
import { TransactionJSON } from '../transaction_types';
export declare const isValidValue: (value: unknown) => boolean;
export declare const checkRequiredFields: (requiredFields: ReadonlyArray<string>, data: {
    readonly [key: string]: unknown;
}) => boolean;
export declare const getAssetDataForTransferTransaction: ({ data, }: TransferAsset) => Buffer;
export declare const getAssetDataForRegisterSecondSignatureTransaction: ({ signature, }: SecondSignatureAsset) => Buffer;
export declare const getAssetDataForRegisterDelegateTransaction: ({ delegate, }: DelegateAsset) => Buffer;
export declare const getAssetDataForCastVotesTransaction: ({ votes, }: VoteAsset) => Buffer;
export declare const getAssetDataForRegisterMultisignatureAccountTransaction: ({ multisignature, }: MultiSignatureAsset) => Buffer;
export declare const getAssetDataForCreateDappTransaction: ({ dapp, }: DappAsset) => Buffer;
export interface InTransferAsset {
    readonly inTransfer: {
        readonly dappId: string;
    };
}
export declare const getAssetDataForTransferIntoDappTransaction: ({ inTransfer, }: InTransferAsset) => Buffer;
export interface OutTransferAsset {
    readonly outTransfer: {
        readonly dappId: string;
        readonly transactionId: string;
    };
}
export declare const getAssetDataForTransferOutOfDappTransaction: ({ outTransfer, }: OutTransferAsset) => Buffer;
export declare const getAssetBytes: (transaction: TransactionJSON) => Buffer;
export declare const checkTransaction: (transaction: TransactionJSON) => boolean;
export declare const getTransactionBytes: (transaction: TransactionJSON) => Buffer;
