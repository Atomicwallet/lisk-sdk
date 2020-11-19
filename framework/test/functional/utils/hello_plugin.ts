/*
 * Copyright © 2020 Lisk Foundation
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
 */
import { ActionsDefinition, BaseChannel, BasePlugin, EventsArray, PluginInfo } from '../../../src';

export class HelloPlugin extends BasePlugin {
	private _channel!: BaseChannel;
	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public static get alias(): string {
		return 'hello';
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public static get info(): PluginInfo {
		return {
			author: 'hello',
			name: 'hello',
			version: '2.1',
			exportPath: __filename,
		};
	}

	public async load(channel: BaseChannel): Promise<void> {
		this._channel = channel;
		this._channel.publish('hello:greet', { message: 'hello event' });
	}

	// eslint-disable-next-line class-methods-use-this
	public async unload(): Promise<void> {}

	// eslint-disable-next-line class-methods-use-this
	public get defaults(): object {
		return {};
	}

	// eslint-disable-next-line class-methods-use-this
	public get events(): EventsArray {
		return ['greet'];
	}

	// eslint-disable-next-line class-methods-use-this
	public get actions(): ActionsDefinition {
		return {
			callGreet: () => {
				return { greet: 'hi, how are you?' };
			},
			publishGreetEvent: async () => {
				this._channel.publish('hello:greet', { message: 'hello event' });

				return 'invoked';
			},
		};
	}
}
