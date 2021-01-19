/* eslint-disable class-methods-use-this */
import { TransactionCreateCommand } from 'lisk-commander';
import { Application, PartialApplicationConfig } from 'lisk-sdk';
import { getApplication } from '../../app/app';

export default class CreateCommand extends TransactionCreateCommand {
	public getApplication(
		genesisBlock: Record<string, unknown>,
		config: PartialApplicationConfig,
	): Application {
		const app = getApplication(genesisBlock, config);
		return app;
	}
}
