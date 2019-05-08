import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class EncryptCommand extends BaseCommand {
	static description: string;
	static examples: string[];
	static flags: {
		password: flagParser.IOptionFlag<string>;
		passphrase: flagParser.IOptionFlag<string>;
		outputPublicKey: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
		json: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
		pretty: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
	};
	run(): Promise<void>;
}
