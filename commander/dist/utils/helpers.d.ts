export declare const validateLifetime: (lifetime: string) => boolean;
export declare const validateMinimum: (minimum: string) => boolean;
export declare const validateAmount: (amount: string) => boolean;
interface ErrorMessageObject {
	readonly error: string;
}
export declare const createErrorHandler: (
	prefix: string,
) => ({ message }: { readonly message: string }) => ErrorMessageObject;
interface ErrorObject {
	readonly errno: string | number;
}
export declare const handleEPIPE: (err: ErrorObject) => void;
export declare const stdoutIsTTY: () => true;
export declare const stdinIsTTY: () => true;
export {};
