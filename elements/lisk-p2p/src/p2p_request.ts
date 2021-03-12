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
 *
 */
import { RPCResponseAlreadySentError } from './errors';
import { P2PResponsePacketBufferData } from './types';

export interface RequestOptions {
	readonly procedure: string;
	readonly data: unknown;
	readonly id: string;
	readonly rate: number;
	productivity: {
		requestCounter: number;
		responseCounter: number;
		responseRate: number;
		lastResponded: number;
	};
}

export class P2PRequest {
	private readonly _procedure: string;
	private readonly _data: unknown;
	private readonly _respondCallback: (
		responseError?: Error,
		responseData?: P2PResponsePacketBufferData,
	) => void;
	private readonly _peerId: string;
	private _wasResponseSent: boolean;
	private readonly _rate: number;

	public constructor(
		options: RequestOptions,
		respondCallback: (responseError?: Error, responseData?: unknown) => void,
	) {
		this._procedure = options.procedure;
		this._data = options.data;
		this._peerId = options.id;
		this._rate = options.rate;
		// eslint-disable-next-line no-param-reassign
		options.productivity.requestCounter += 1;
		this._respondCallback = (
			responseError?: Error,
			responsePacket?: P2PResponsePacketBufferData,
		): void => {
			if (this._wasResponseSent) {
				throw new RPCResponseAlreadySentError(
					`A response has already been sent for the request procedure <<${options.procedure}>>`,
				);
			}
			this._wasResponseSent = true;
			// We assume peer performed useful work and update peer response rate
			if (!responseError && responsePacket) {
				// eslint-disable-next-line no-param-reassign
				options.productivity.lastResponded = Date.now();
				// eslint-disable-next-line no-param-reassign
				options.productivity.responseCounter += 1;
			}
			// eslint-disable-next-line no-param-reassign
			options.productivity.responseRate =
				options.productivity.responseCounter / options.productivity.requestCounter;

			let responsePacketBufferData: Buffer | undefined;
			if (responsePacket?.data && typeof responsePacket?.data === 'string') {
				responsePacketBufferData = Buffer.from(responsePacket.data, 'binary');
			}
			respondCallback(responseError, responsePacketBufferData);
		};
		this._wasResponseSent = false;
	}

	public get procedure(): string {
		return this._procedure;
	}

	public get data(): unknown {
		return this._data;
	}

	public get rate(): number {
		return this._rate;
	}

	public get peerId(): string {
		return this._peerId;
	}

	public get wasResponseSent(): boolean {
		return this._wasResponseSent;
	}

	public end(responseData: Buffer): void {
		const responsePacket: P2PResponsePacketBufferData = {
			data: responseData,
			peerId: this.peerId,
		};
		this._respondCallback(undefined, responsePacket);
	}

	public error(responseError: Error): void {
		this._respondCallback(responseError);
	}
}
