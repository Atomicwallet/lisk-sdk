import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class SignCommand extends BaseCommand {
	static args: {
		name: string;
		description: string;
	}[];
	static description: string;
	static examples: string[];
	static flags: {
		passphrase: flagParser.IOptionFlag<string>;
		'second-passphrase': flagParser.IOptionFlag<string>;
		json: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
		pretty: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
	};
	run(): Promise<void>;
}
