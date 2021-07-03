import { Transaction } from './transaction_pool';
export declare type CheckerFunction = (transactions: ReadonlyArray<Transaction>) => Promise<CheckerFunctionResponse>;
export interface CheckerFunctionResponse {
    status: Status;
    transactionsResponses: ReadonlyArray<TransactionResponse>;
}
export interface TransactionResponse {
    readonly errors: ReadonlyArray<Error>;
    readonly id: string;
    readonly status: Status;
}
export declare enum Status {
    FAIL = 0,
    OK = 1,
    PENDING = 2
}
export interface CheckTransactionsResponseWithPassAndFail {
    failedTransactions: ReadonlyArray<Transaction>;
    passedTransactions: ReadonlyArray<Transaction>;
}
export interface CheckTransactionsResponseWithPassFailAndPending {
    failedTransactions: ReadonlyArray<Transaction>;
    passedTransactions: ReadonlyArray<Transaction>;
    pendingTransactions: ReadonlyArray<Transaction>;
}
export declare const checkTransactionsWithPassAndFail: (transactions: ReadonlyArray<Transaction>, checkerFunction: CheckerFunction) => Promise<CheckTransactionsResponseWithPassAndFail>;
export declare const checkTransactionsWithPassFailAndPending: (transactions: ReadonlyArray<Transaction>, checkerFunction: CheckerFunction) => Promise<CheckTransactionsResponseWithPassFailAndPending>;
