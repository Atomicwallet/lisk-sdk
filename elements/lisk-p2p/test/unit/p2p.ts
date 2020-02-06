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
import { P2P } from '../../src/p2p';
import { constructPeerId } from '../../src/utils';

describe('p2p', () => {
	let P2PNode: P2P;

	const generatedPeers = [...Array(10).keys()].map(i => ({
		ipAddress: '120.0.0.' + i,
		wsPort: 5000 + i,
	}));

	beforeEach(async () => {
		P2PNode = new P2P({
			seedPeers: [],
			blacklistedIPs: generatedPeers.slice(6).map(peer => peer.ipAddress),
			fixedPeers: generatedPeers.slice(0, 6),
			whitelistedPeers: generatedPeers.slice(2, 3),
			previousPeers: generatedPeers.slice(4, 5),
			connectTimeout: 5000,
			maxOutboundConnections: 20,
			maxInboundConnections: 100,
			nodeInfo: {
				wsPort: 5000,
				networkId:
					'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
				version: '1.1.1',
				protocolVersion: '1.1',
				os: 'darwin',
				height: 0,
				options: {},
				nonce: 'nonce',
				advertiseAddress: true,
			},
		});

		await P2PNode.start();
	});

	afterEach(async () => {
		try {
			await P2PNode.stop();
		} catch (e) {}
	});

	describe('#constructor', () => {
		it('should be an object', () => {
			return expect(P2PNode).toEqual(expect.any(Object));
		});

		it('should be an instance of P2P', () => {
			return expect(P2PNode).toBeInstanceOf(P2P);
		});

		it('should load PeerBook with correct fixedPeer hierarchy', async () => {
			const expectedFixedPeers = generatedPeers
				.slice(0, 6)
				.map(peer => constructPeerId(peer.ipAddress, peer.wsPort));

			expect(expectedFixedPeers).toIncludeSameMembers(
				P2PNode['_peerBook'].allPeers
					.filter(peer => peer.internalState?.peerKind == 'fixedPeer')
					.map(peer => peer.peerId),
			);
		});

		it('should reject at multiple start attempt', async () => {
			expect(P2PNode.start()).rejects.toThrow();
		});

		it('should reject at multiple stop attempt', async () => {
			await P2PNode.stop();
			expect(P2PNode.stop()).rejects.toThrow();
		});
	});
});
