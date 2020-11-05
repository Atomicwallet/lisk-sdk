/*
 * Copyright © 2019 Lisk Foundation
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

// eslint-disable-next-line
/// <reference path="../../../external_types/pm2-axon/index.d.ts" />
// eslint-disable-next-line
/// <reference path="../../../external_types/pm2-axon-rpc/index.d.ts" />

import { EventEmitter2, Listener } from 'eventemitter2';
import { Server as RPCServer, Client as RPCClient } from 'pm2-axon-rpc';
import { PubSocket, PullSocket, PushSocket, SubSocket } from 'pm2-axon';
import { Action, ActionsDefinition } from '../action';
import { Event, EventInfoObject } from '../event';
import { BaseChannel, BaseChannelOptions } from './base_channel';
import { IPCClient } from '../ipc/ipc_client';
import { ActionInfoForBus, SocketPaths } from '../../types';
import * as JSONRPC from '../jsonrpc';

type NodeCallback = (error: Error | null, result?: unknown) => void;

interface ChildProcessOptions extends BaseChannelOptions {
	socketsPath: SocketPaths;
}

export class IPCChannel extends BaseChannel {
	private readonly _emitter: EventEmitter2;
	private readonly _ipcClient: IPCClient;

	public constructor(
		moduleAlias: string,
		events: ReadonlyArray<string>,
		actions: ActionsDefinition,
		options: ChildProcessOptions,
	) {
		super(moduleAlias, events, actions, options);

		this._ipcClient = new IPCClient({
			socketsDir: options.socketsPath.root,
			name: moduleAlias,
			rpcServerSocketPath: `unix://${options.socketsPath.root}/bus_rpc_socket.sock`,
		});

		this._emitter = new EventEmitter2({
			wildcard: true,
			delimiter: ':',
			maxListeners: 1000,
		});
	}

	public async startAndListen(): Promise<void> {
		await this._ipcClient.start();
		// Listen to messages
		this._subSocket.on('message', (eventName: string, eventData: EventInfoObject) => {
			const event = new Event(eventName, eventData);
			if (event.module !== this.moduleAlias) {
				this._emitter.emit(eventName, eventData);
			}
		});
	}

	public async registerToBus(): Promise<void> {
		// Start IPCClient and subscribe to socket messages
		await this.startAndListen();
		// Register channel details
		await new Promise((resolve, reject) => {
			let actionsInfo: { [key: string]: ActionInfoForBus } = {};
			actionsInfo = Object.keys(this.actions).reduce((accumulator, value: string) => {
				accumulator[value] = {
					name: value,
					module: this.moduleAlias,
				};
				return accumulator;
			}, actionsInfo);

			this._rpcClient.call(
				'registerChannel',
				this.moduleAlias,
				this.eventsList.map((event: string) => event),
				actionsInfo,
				{
					type: 'ipcSocket',
					rpcSocketPath: this._ipcClient.rpcServerSocketPath,
				},
				(err: Error, result: object) => {
					if (err !== undefined && err !== null) {
						reject(err);
					}
					resolve(result);
				},
			);
		});

		// Channel RPC Server is only required if the module has actions
		if (this.actionsList.length > 0) {
			this._rpcServer.expose('invoke', (action, cb: NodeCallback) => {
				const actionObject = Action.fromJSONRPC(action);
				this.invoke(`${actionObject.module}:${actionObject.name}`, actionObject.params)
					.then(data => cb(null, data))
					.catch(error => cb(error));
			});
		}
	}

	public subscribe(eventName: string, cb: Listener): void {
		const event = new Event(eventName);
		this._emitter.on(event.key(), (notificationObject: JSONRPC.NotificationObject) =>
			// When IPC channel used without bus the data will not contain result
			setImmediate(cb, { data: notificationObject.result ?? notificationObject }),
		);
	}

	public once(eventName: string, cb: Listener): void {
		const event = new Event(eventName);
		this._emitter.once(event.key(), (notificationObject: JSONRPC.NotificationObject) => {
			// When IPC channel used without bus the data will not contain result
			setImmediate(cb, { data: notificationObject.result ?? notificationObject });
		});
	}

	public publish(eventName: string, data?: object): void {
		const event = new Event(eventName, data);
		if (event.module !== this.moduleAlias || !this.eventsList.includes(event.name)) {
			throw new Error(`Event "${eventName}" not registered in "${this.moduleAlias}" module.`);
		}

		this._pubSocket.send(event.key(), data);
	}

	public async invoke<T>(actionName: string, params?: object): Promise<T> {
		const action = new Action(null, actionName, params);

		if (action.module === this.moduleAlias) {
			const handler = this.actions[action.name]?.handler;
			if (!handler) {
				throw new Error('Handler does not exist.');
			}
			// change this to lisk format
			return handler(action.toObject()) as T;
		}

		return new Promise((resolve, reject) => {
			this._rpcClient.call(
				'invoke',
				action.toJSONRPC(),
				(err: JSONRPC.ErrorObject, data: JSONRPC.SuccessObject) => {
					if (err) {
						return reject(err.error.data);
					}

					return resolve((data.result as unknown) as T);
				},
			);
		});
	}

	public cleanup(_status?: number, _message?: string): void {
		this._ipcClient.stop();
	}

	private get _rpcServer(): RPCServer {
		return this._ipcClient.rpcServer;
	}

	private get _rpcClient(): RPCClient {
		return this._ipcClient.rpcClient;
	}

	private get _pubSocket(): PubSocket | PushSocket {
		return this._ipcClient.pubSocket;
	}

	private get _subSocket(): PullSocket | SubSocket {
		return this._ipcClient.subSocket;
	}
}
