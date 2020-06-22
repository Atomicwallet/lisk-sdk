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
import * as ip from 'ip';
import { Request, Response, NextFunction } from 'express';

const defualtOption = { whiteList: [] };

const checkIpInList = (list: ReadonlyArray<string>, addr: string): boolean => {
	let entry;
	for (const value of list) {
		entry = value;
		if (ip.isV4Format(entry)) {
			// IPv4 host entry
			entry += '/32';
		} else if (ip.isV6Format(entry)) {
			// IPv6 host entry
			entry += '/128';
		}
		try {
			entry = ip.cidrSubnet(entry);
			if (entry.contains(addr)) {
				return true;
			}
		} catch (err) {
			console.error('CheckIpInList:', err.toString());
		}
	}
	return false;
};

export const whiteListMiddleware = ({
	whiteList,
}: { whiteList: ReadonlyArray<string> } = defualtOption) => (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	if (whiteList.length === 0 || checkIpInList(whiteList, req.ip)) {
		next();
		return;
	}

	next(new Error('Access Denied'));
};
