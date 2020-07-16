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
import { Request, Response, NextFunction } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';

export const getForgers = (channel: BaseChannel, codec: PluginCodec) => async (
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	let forgersInfo: ReadonlyArray<{ address: string; forging: boolean }>;
	try {
		forgersInfo = await channel.invoke('app:getForgersInfoForRound');
	} catch (err) {
		next(err);
		return;
	}
	try {
		const forgerAccounts = await channel.invoke<Buffer[]>('app:getAccounts', {
			address: forgersInfo.map(forgerInfo => forgerInfo.address),
		});

		const data = [];
		for (let i = 0; i < forgerAccounts.length; i += 1) {
			const account = codec.decodeAccount(forgerAccounts[i]);

			data.push({
				username: account.asset.delegate.username,
				totalVotesReceived: account.asset.delegate.totalVotesReceived,
				...forgersInfo[i],
			});
		}

		res.status(200).send(data);
	} catch (err) {
		next(err);
	}
};
