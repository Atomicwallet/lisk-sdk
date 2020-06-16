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
export const customNodeInfoSchema = {
	$id: '/nodeInfo',
	type: 'object',
	properties: {
		maxHeightPrevoted: {
			dataType: 'uint32',
			fieldNumber: 8,
		},
		maxHeightPreviouslyForged: {
			dataType: 'uint32',
			fieldNumber: 9,
		},
	},
	required: ['networkId', 'protocolVersion', 'wsPort', 'nonce'],
};

export const customPeerInfoSchema = {
	$id: '/peerInfo',
	type: 'object',
	properties: {
		maxHeightPrevoted: {
			dataType: 'uint32',
			fieldNumber: 8,
		},
		maxHeightPreviouslyForged: {
			dataType: 'uint32',
			fieldNumber: 9,
		},
	},
	required: ['ipAddress', 'wsPort'],
};
