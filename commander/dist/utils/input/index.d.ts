export declare const getFirstLineFromString: (
	multilineString: unknown,
) => string;
interface InputSource {
	readonly repeatPrompt?: boolean;
	readonly source?: string;
}
interface InputFromSourceInputs {
	readonly data?: InputSource;
	readonly passphrase?: InputSource;
	readonly password?: InputSource;
	readonly secondPassphrase?: InputSource;
}
export interface InputFromSourceOutput {
	readonly data?: string;
	readonly passphrase?: string;
	readonly password?: string;
	readonly secondPassphrase?: string;
}
export declare const getInputsFromSources: ({
	passphrase: passphraseInput,
	secondPassphrase: secondPassphraseInput,
	password: passwordInput,
	data: dataInput,
}: InputFromSourceInputs) => Promise<InputFromSourceOutput>;
export {};
