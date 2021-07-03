import { ErrorObject } from 'ajv';
import { TransactionJSON } from '../../transaction_types';
export interface ValidationResult {
    readonly errors?: ReadonlyArray<ErrorObject>;
    readonly valid: boolean;
}
export declare const validateTransaction: (tx: TransactionJSON) => ValidationResult;
