/*
 * Copyright © 2018 Lisk Foundation
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

'use strict';

const _ = require('lodash');
const semver = require('semver');
const scClient = require('socketcluster-client');
const WAMPClient = require('wamp-socket-cluster/WAMPClient');
const failureCodes = require('../../../api/ws/rpc/failure_codes');
const System = require('../../../modules/system');
const wsRPC = require('../../../api/ws/rpc/ws_rpc').wsRPC;
const Peer = require('../../../logic/peer');

const TIMEOUT = 2000;

const wampClient = new WAMPClient(TIMEOUT); // Timeout failed requests after 1 second
const socketConnections = {};

const connect = (peer, logger) => {
	const wsServer = wsRPC.getServer();

	connectSteps.addConnectionOptions(peer);
	connectSteps.addSocket(peer, logger);
	connectSteps.upgradeSocketAsWAMPClient(peer);
	connectSteps.upgradeSocketAsWAMPServer(peer, wsServer);
	connectSteps.registerRPC(peer, logger, wsServer);

	connectSteps.registerSocketListeners(peer, logger);

	return peer;
};

const connectSteps = {
	addConnectionOptions: peer => {
		const systemHeaders = System.getHeaders();
		const queryParams = {};

		if (systemHeaders.version != null) {
			/*
				if current node is also running a prelease version
				if destination node is running a pre-release and
				if destination node version is >0.9.16 and <=1.0.0-rc.3
			 */
			if (
				semver.prerelease(systemHeaders.version) !== null &&
				semver.prerelease(peer.version) !== null &&
				semver.lte(peer.version, '1.0.0-rc.3') &&
				semver.gt(peer.version, '0.9.16')
			) {
				const versionComponents = systemHeaders.version;

				// Strip the prelease tag from the version so it can work
				// with semver.satisfies at modules.system.versionCompatible
				// https://github.com/LiskHQ/lisk/issues/2389
				queryParams.version = `${versionComponents.major}.${
					versionComponents.minor
				}.${versionComponents.patch}`;
			} else {
				queryParams.version = systemHeaders.version;
			}
		}
		if (systemHeaders.wsPort != null) {
			queryParams.wsPort = systemHeaders.wsPort;
		}
		if (systemHeaders.httpPort != null) {
			queryParams.httpPort = systemHeaders.httpPort;
		}
		if (systemHeaders.nethash != null) {
			queryParams.nethash = systemHeaders.nethash;
		}
		if (systemHeaders.nonce != null) {
			queryParams.nonce = systemHeaders.nonce;
		}
		peer.connectionOptions = {
			autoConnect: false, // Lazy connection establishment
			autoReconnect: false,
			connectTimeout: TIMEOUT,
			ackTimeout: TIMEOUT,
			pingTimeoutDisabled: true,
			port: peer.wsPort,
			hostname: peer.ip,
			query: queryParams,
			multiplex: false,
		};
		return peer;
	},

	addSocket: (peer, logger) => {
		peer.socket = scClient.connect(peer.connectionOptions);

		if (peer.socket && Object.keys(socketConnections).length < 1000) {
			const hostname = peer.socket.options.hostname;
			if (!socketConnections[hostname]) {
				socketConnections[hostname] = { closed: 0, open: 0, disconnect: 0 };
			}

			if (peer.socket.state === 'closed') {
				socketConnections[hostname].closed += 1;
			} else if (peer.socket.state === 'open') {
				socketConnections[hostname].open += 1;
			} else if (peer.socket.state === 'disconnect') {
				socketConnections[hostname].disconnect += 1;
			}

			logger.trace(
				`${socketConnections[hostname].closed}:closed, ${
					socketConnections[hostname].open
				}:open and ${
					socketConnections[hostname].disconnect
				}:disconnect websocket connection to peer ${
					peer.socket.options.hostname
				}.`
			);
		}

		return peer;
	},

	upgradeSocketAsWAMPClient: peer => {
		wampClient.upgradeToWAMP(peer.socket);
		return peer;
	},

	upgradeSocketAsWAMPServer: (peer, wsServer) => {
		wsServer.upgradeToWAMP(peer.socket);
		return peer;
	},

	registerRPC: (peer, logger, wsServer) => {
		// Assemble empty RPC entry
		peer.rpc = {};
		// Register RPC methods on peer
		peer = _.reduce(
			wsServer.endpoints.rpc,
			(peerExtendedWithRPC, localHandler, rpcProcedureName) => {
				peerExtendedWithRPC.rpc[rpcProcedureName] = (data, rpcCallback) => {
					// Provide default parameters if called with non standard parameter, callback
					rpcCallback =
						typeof rpcCallback === 'function'
							? rpcCallback
							: typeof data === 'function' ? data : () => {};
					data = data && typeof data !== 'function' ? data : {};

					logger.trace(
						`[Outbound socket :: call] Peer RPC procedure '${rpcProcedureName}' called with data`,
						data
					);

					if (peer.socket) {
						peer.socket
							.call(rpcProcedureName, data)
							.then(res => {
								setImmediate(rpcCallback, null, res);
							})
							.catch(err => {
								setImmediate(rpcCallback, err);
							});
					} else {
						const rpcNotExistError =
							'Tried to call RPC function on outbound peer socket which no longer exists';
						logger.debug(rpcNotExistError);
						setImmediate(rpcCallback, rpcNotExistError);
					}
				};
				return peerExtendedWithRPC;
			},
			peer
		);

		// Register Publish methods on peer
		return _.reduce(
			wsServer.endpoints.event,
			(peerExtendedWithPublish, localHandler, eventProcedureName) => {
				peerExtendedWithPublish.rpc[eventProcedureName] = data => {
					logger.trace(
						`[Outbound socket :: emit] Peer event '${eventProcedureName}' called with data`,
						data
					);
					if (peer.socket) {
						peer.socket.emit(eventProcedureName, data);
					} else {
						const eventNotExistError = `Tried to emit event on outbound peer socket '${
							peerExtendedWithPublish.string
						}' which no longer exists`;
						logger.debug(eventNotExistError);
						logger.trace(
							'Peer does not have a socket',
							peerExtendedWithPublish.object()
						);
					}
				};
				return peerExtendedWithPublish;
			},
			peer
		);
	},

	registerSocketListeners: (peer, logger) => {
		const socket = peer.socket;

		socket.on('connect', () => {
			logger.trace(
				`[Outbound socket :: connect] Peer connection to ${
					peer.string
				} established`
			);
		});

		socket.on('disconnect', () => {
			logger.trace(
				`[Outbound socket :: disconnect] Peer connection to ${
					peer.string
				} disconnected`
			);
		});

		// When handshake process will fail - disconnect
		// ToDo: Use parameters code and description returned while handshake fails
		socket.on('connectAbort', () => {
			socket.disconnect(
				failureCodes.HANDSHAKE_ERROR,
				failureCodes.errorMessages[failureCodes.HANDSHAKE_ERROR]
			);
		});

		// When error on transport layer occurs - disconnect
		socket.on('error', err => {
			logger.debug(
				`[Outbound socket :: error] Peer error from ${peer.string} - ${
					err.message
				}`
			);
			socket.disconnect(
				1000,
				'Intentionally disconnected from peer because of error'
			);
		});

		// When WS connection ends - remove peer
		socket.on('close', (code, reason) => {
			logger.debug(
				`[Outbound socket :: close] Peer connection to ${
					peer.string
				} closed with code ${code} and reason - ${reason}`
			);

			if (peer.socket && peer.socket.state === peer.socket.CLOSED) {
				peer.state = Peer.STATE.DISCONNECTED;
			}

			socket.destroy();
			if (socket === peer.socket) {
				delete peer.socket;
			}
		});

		// The 'message' event can be used to log all low-level WebSocket messages.
		socket.on('message', message => {
			logger.trace(
				`[Outbound socket :: message] Peer message from ${
					peer.string
				} received - ${message}`
			);
		});
		return peer;
	},
};

module.exports = connect;
