import { flags as flagParser } from '@oclif/command';
import BaseCommand from '../../base';
export default class CreateCommand extends BaseCommand {
	static description: string;
	static examples: string[];
	static flags: {
		number: flagParser.IOptionFlag<string>;
		json: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
		pretty: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>;
	};
	run(): Promise<void>;
}
