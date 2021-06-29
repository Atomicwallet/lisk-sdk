import { LiskValidationError } from '@liskhq/lisk-validator';
export declare const validateTransaction: (assetSchema: object, transactionObject: Record<string, unknown>) => LiskValidationError | Error | undefined;
