import { TransactionError } from './errors';
export declare enum Status {
    FAIL = 0,
    OK = 1,
    PENDING = 2
}
export interface TransactionResponse {
    readonly id: string;
    readonly status: Status;
    readonly errors: ReadonlyArray<TransactionError>;
}
export declare const createResponse: (id: string, errors?: ReadonlyArray<TransactionError>) => {
    id: string;
    status: Status;
    errors: readonly TransactionError[];
};
