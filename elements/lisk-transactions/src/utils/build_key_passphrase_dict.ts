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
 *
 */

import { getPrivateAndPublicKeyFromPassphrase } from '@liskhq/lisk-cryptography';

interface PublicKeyPassphraseDict {
	[key: string]: {
		readonly privateKey: string;
		readonly publicKey: string;
		readonly passphrase: string;
	};
}

export const buildPublicKeyPassphraseDict = (
	passphrases: readonly string[],
): PublicKeyPassphraseDict => {
	const publicKeyPassphrase: PublicKeyPassphraseDict = {};

	passphrases.forEach(aPassphrase => {
		const keys = getPrivateAndPublicKeyFromPassphrase(aPassphrase);
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!publicKeyPassphrase[keys.publicKey]) {
			publicKeyPassphrase[keys.publicKey] = {
				...keys,
				passphrase: aPassphrase,
			};
		}
	});

	return publicKeyPassphrase;
};
