/*
 * LiskHQ/lisk-commander
 * Copyright © 2021 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import { join } from 'path';
import Generator from 'yeoman-generator';

interface PluginPrompts {
	author: string;
	version: string;
	name: string;
}

export default class PluginGenerator extends Generator {
	private _answers!: PluginPrompts | undefined;
	private _path!: string;
	private _packageJSON!: Record<string, unknown> | undefined;

	async prompting() {
		this._path = join(__dirname, '..', 'templates');

		// Check for existing package.json in root directory to use existing info
		try {
			this._packageJSON = (await import(`${this.destinationRoot()}/src/app/package.json`));
		} catch (err) {
			this._packageJSON = undefined;
		}

		this._answers = this._packageJSON ? undefined : (await this.prompt([
			{
				type: 'input',
				name: 'author',
				message: 'Author of plugin',
			},
			{
				type: 'input',
				name: 'version',
				message: 'Version of plugin',
				default: '0.1.0',
			},
			{
				type: 'input',
				name: 'name',
				message: 'Name of plugin',
			},
		])) as PluginPrompts;
	}

	public createSkeleton(): void {
		const className = `${this.options.alias.charAt(0).toUpperCase() + this.options.alias.slice(1)}Plugin`;

		this.fs.copyTpl(
			`${this._path}/plugin/src/app/plugins/plugin.ts`,
			join(this.destinationRoot(), `app/src/app/plugins/${this.options.alias}/`, `${this.options.alias}.ts`),
			{
				alias: this.options.alias,
				className,
				author: this._packageJSON?.author ?? this._answers?.author,
				version: this._packageJSON?.version ?? this._answers?.version,
				name: this._packageJSON?.name ?? this._answers?.name,
			},
			{},
			{ globOptions: { dot: true, ignore: ['.DS_Store'] } },
		);

		this.fs.copyTpl(
			`${this._path}/plugin/test/unit/plugins/plugin.ts`,
			join(this.destinationRoot(), `app/test/unit/plugins/${className}/`, `${this.options.alias}.spec.ts`),
			{
				className,
			},
			{},
			{ globOptions: { dot: true, ignore: ['.DS_Store'] } },
		);

		this.fs.copyTpl(
			`${this._path}/plugin/src/app/plugins/index.ts`,
			join(this.destinationRoot(), `app/src/app/plugins/${this.options.alias}/`, 'index.ts'),
			{},
			{},
			{ globOptions: { dot: true, ignore: ['.DS_Store'] } },
		);
	}
}
