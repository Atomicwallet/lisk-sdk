import BaseCommand from '../../base';
export default class StatusCommand extends BaseCommand {
	static args: {
		name: string;
		description: string;
		required: boolean;
	}[];
	static description: string;
	static examples: string[];
	run(): Promise<void>;
}
