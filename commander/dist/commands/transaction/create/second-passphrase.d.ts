import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../../base';
import { InputFromSourceOutput } from '../../../utils/input';
export declare const processInputs: () => ({
	passphrase,
	secondPassphrase,
}: InputFromSourceOutput) => Partial<
	import('@liskhq/lisk-transactions').TransactionJSON
>;
export default class SecondPassphraseCommand extends BaseCommand {
	static description: string;
	static examples: string[];
	static flags: {
		passphrase: flagParser.IOptionFlag<string>;
		'second-passphrase': flagParser.IOptionFlag<string>;
		'no-signature': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
		json: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
		pretty: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
	};
	run(): Promise<void>;
}
