export interface APIErrorData {
    readonly code?: string;
    readonly message?: string;
}
export declare class APIError extends Error {
    errno: number;
    errors?: ReadonlyArray<APIErrorData>;
    constructor(message?: string, errno?: number, errors?: ReadonlyArray<APIErrorData>);
}
