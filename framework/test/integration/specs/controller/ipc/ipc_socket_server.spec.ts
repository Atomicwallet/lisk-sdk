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

import { resolve } from 'path';
import { homedir } from 'os';
import { IPCSocketServer } from '../../../../../src/controller/ipc/ipc_socket_server';

describe('IPCSocketServer', () => {
	let server: IPCSocketServer;

	beforeEach(() => {
		server = new IPCSocketServer({
			socketDir: resolve(`${homedir()}/.lisk/devnet/tmp/sockets`),
		});
	});

	afterEach(() => {
		server.close();
	});

	describe('start', () => {
		it('should init socket objects and resolve', async () => {
			// Act && Assert
			await expect(server.start()).resolves.toBeUndefined();
		});
	});
});
