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
import * as os from 'os';
import { APIClient } from '../src/api_client';

describe('APIClient module', () => {
	const mainnetHash =
		'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';
	const mainnetNodes: ReadonlyArray<string> = [
		'https://node01.lisk.io:443',
		'https://node02.lisk.io:443',
		'https://node03.lisk.io:443',
		'https://node04.lisk.io:443',
		'https://node05.lisk.io:443',
		'https://node06.lisk.io:443',
		'https://node07.lisk.io:443',
		'https://node08.lisk.io:443',
	];
	const testnetHash =
		'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
	const testnetNodes: ReadonlyArray<string> = ['https://testnet.lisk.io:443'];
	const locale =
		process.env.LC_ALL ??
		process.env.LC_MESSAGES ??
		process.env.LANG ??
		process.env.LANGUAGE;
	const platformInfo = `${os.platform()} ${os.release()}; ${os.arch()}${
		locale ? `; ${locale}` : ''
	}`;
	const baseUserAgent = `LiskElements/1.0 (+https://github.com/LiskHQ/lisk-elements) ${platformInfo}`;
	const customUserAgent = `LiskHub/5.0 (+https://github.com/LiskHQ/lisk-hub) ${baseUserAgent}`;
	const defaultHeaders = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};

	const customHeaders = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		'User-Agent': customUserAgent,
		nethash: testnetHash,
	};

	const localNode = 'http://localhost:7000';
	const externalNode = 'https://googIe.com:8080';
	const sslNode = 'https://external.lisk.io:443';
	const externalTestnetNode = 'http://testnet.lisk.io';
	const defaultNodes: ReadonlyArray<string> = [
		localNode,
		externalNode,
		sslNode,
	];
	const defaultSelectedNode = 'selected_node';

	let apiClient: APIClient;

	beforeEach(async () => {
		apiClient = new APIClient(defaultNodes);
		return Promise.resolve();
	});

	describe('#constructor', () => {
		let initializeStub: jest.SpyInstance;

		beforeEach(async () => {
			initializeStub = jest.spyOn(APIClient.prototype, 'initialize');
			return Promise.resolve();
		});

		it('should create a new instance of APIClient', () => {
			return expect(apiClient).toBeInstanceOf(APIClient);
		});

		it('should call initialize with the nodes and default options', () => {
			apiClient = new APIClient(defaultNodes);
			return expect(initializeStub).toHaveBeenCalledWith(defaultNodes, {});
		});

		it('should call initialize with the nodes and provided options', () => {
			const providedOptions = {
				genesisBlockPayloadHash:
					'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
			};
			apiClient = new APIClient(defaultNodes, providedOptions);
			return expect(initializeStub).toHaveBeenCalledWith(
				defaultNodes,
				providedOptions,
			);
		});
	});

	describe('#createMainnetAPIClient', () => {
		let client: APIClient;
		beforeEach(async () => {
			client = APIClient.createMainnetAPIClient();
			return Promise.resolve();
		});

		it('should return APIClient instance', () => {
			return expect(client).toBeInstanceOf(APIClient);
		});

		it('should contain mainnet nodes', () => {
			return expect(client.nodes).toEqual(mainnetNodes);
		});

		it('should be set to mainnet hash', () => {
			return expect(client.headers.nethash).toBe(mainnetHash);
		});
	});

	describe('#createTestnetAPIClient', () => {
		let client: APIClient;
		beforeEach(async () => {
			client = APIClient.createTestnetAPIClient();
			return Promise.resolve();
		});

		it('should return APIClient instance', () => {
			return expect(client).toBeInstanceOf(APIClient);
		});

		it('should contain testnet nodes', () => {
			return expect(client.nodes).toEqual(testnetNodes);
		});

		it('should be set to testnet hash', () => {
			return expect(client.headers.nethash).toBe(testnetHash);
		});
	});

	describe('#constants', () => {
		it('should expose API constants', () => {
			return expect(APIClient.constants).toBeObject();
		});
	});

	describe('#initialize', () => {
		it('should throw an error if no arguments are passed to constructor', () => {
			return expect(apiClient.initialize.bind(apiClient)).toThrow(Error);
		});

		it('should throw an error if first argument passed to constructor is not array', () => {
			return expect(
				apiClient.initialize.bind(apiClient, 'non-array' as any),
			).toThrow(Error);
		});

		it('should throw an error if first argument passed to constructor is empty array', () => {
			return expect(apiClient.initialize.bind(apiClient, [])).toThrow(Error);
		});

		it('should throw an error if second argument passed to constructor is a string', () => {
			return expect(
				apiClient.initialize.bind(
					apiClient,
					defaultNodes,
					'option string' as any,
				),
			).toThrow(Error);
		});

		it('should throw an error if second argument passed to constructor is an array', () => {
			return expect(
				apiClient.initialize.bind(apiClient, defaultNodes, [] as any),
			).toThrow(Error);
		});

		describe('headers', () => {
			it('should set with passed nethash, with default options', () => {
				return expect(apiClient.headers).toEqual(defaultHeaders);
			});

			it('should set custom headers with supplied options', () => {
				apiClient = new APIClient(defaultNodes, {
					genesisBlockPayloadHash: testnetHash,
					client: {
						name: 'LiskHub',
						version: '5.0',
						engine: '+https://github.com/LiskHQ/lisk-hub',
					},
				});
				return expect(apiClient.headers).toEqual(customHeaders);
			});

			it('should not set User-Agent header when client options were not given', () => {
				apiClient = new APIClient(defaultNodes, {
					genesisBlockPayloadHash: testnetHash,
				});
				return expect(apiClient.headers).not.toHaveProperty('User-Agent');
			});
		});

		describe('nodes', () => {
			it('should have nodes supplied to constructor', () => {
				return expect(apiClient.nodes).toBe(defaultNodes);
			});
		});

		describe('bannedNodes', () => {
			it('should set empty array if no option is passed', () => {
				return expect(apiClient.bannedNodes).toEqual([]);
			});

			it('should set bannedNodes when passed as an option', () => {
				const bannedNodes = ['a', 'b'];
				apiClient = new APIClient(defaultNodes, { bannedNodes });
				return expect(apiClient.bannedNodes).toEqual(bannedNodes);
			});
		});

		describe('currentNode', () => {
			it('should set with random node with initialized setup if no node is specified by options', () => {
				return expect(Object.keys(apiClient)).not.toHaveLength(0);
			});

			it('should set with supplied node if node is specified by options', () => {
				apiClient = new APIClient(defaultNodes, {
					node: externalTestnetNode,
				});
				return expect(apiClient.currentNode).toBe(externalTestnetNode);
			});
		});

		describe('randomizeNodes', () => {
			it('should set randomizeNodes to true when randomizeNodes not explicitly set', () => {
				apiClient = new APIClient(defaultNodes, {
					randomizeNodes: undefined,
				});
				return expect(apiClient.randomizeNodes).toBe(true);
			});

			it('should set randomizeNodes to true on initialization when passed as an option', () => {
				apiClient = new APIClient(defaultNodes, {
					randomizeNodes: true,
				});
				return expect(apiClient.randomizeNodes).toBe(true);
			});

			it('should set randomizeNodes to false on initialization when passed as an option', () => {
				apiClient = new APIClient(defaultNodes, {
					randomizeNodes: false,
				});
				return expect(apiClient.randomizeNodes).toBe(false);
			});
		});
	});

	describe('#getNewNode', () => {
		it('should throw an error if all relevant nodes are banned', () => {
			apiClient.bannedNodes = [...defaultNodes];
			return expect(apiClient.getNewNode.bind(apiClient)).toThrow(
				'Cannot get new node: all nodes have been banned.',
			);
		});

		it('should return a node', () => {
			const result = apiClient.getNewNode();
			return expect(defaultNodes).toEqual(expect.arrayContaining([result]));
		});

		// eslint-disable-next-line jest/expect-expect
		it('should randomly select the node', async () => {
			const firstResult = apiClient.getNewNode();
			let nextResult = apiClient.getNewNode();
			// Test will almost certainly time out if not random
			while (nextResult === firstResult) {
				nextResult = apiClient.getNewNode();
			}
			return Promise.resolve();
		});
	});

	describe('#banNode', () => {
		it('should add node to banned nodes', () => {
			const banned = apiClient.banNode(localNode);
			expect(banned).toBe(true);
			return expect(apiClient.isBanned(localNode)).toBe(true);
		});

		it('should not duplicate a banned node', () => {
			const bannedNodes = [localNode];
			apiClient.bannedNodes = bannedNodes;
			const banned = apiClient.banNode(localNode);

			expect(banned).toBe(false);
			return expect(apiClient.bannedNodes).toEqual(bannedNodes);
		});
	});

	describe('#banActiveNode', () => {
		let currentNode: string;

		beforeEach(async () => {
			({ currentNode } = apiClient);
			return Promise.resolve();
		});

		it('should add current node to banned nodes', () => {
			const banned = apiClient.banActiveNode();
			expect(banned).toBe(true);
			return expect(apiClient.isBanned(currentNode)).toBe(true);
		});

		it('should not duplicate a banned node', () => {
			const bannedNodes = [currentNode];
			apiClient.bannedNodes = bannedNodes;
			const banned = apiClient.banActiveNode();

			expect(banned).toBe(false);
			return expect(apiClient.bannedNodes).toEqual(bannedNodes);
		});
	});

	describe('#banActiveNodeAndSelect', () => {
		let currentNode: string;
		let getNewNodeStub: jest.SpyInstance;

		beforeEach(() => {
			({ currentNode } = apiClient);
			getNewNodeStub = jest
				.spyOn(apiClient, 'getNewNode')
				.mockReturnValue(defaultSelectedNode);
		});

		it('should call ban current node', () => {
			apiClient.banActiveNodeAndSelect();
			return expect(apiClient.isBanned(currentNode)).toBe(true);
		});

		it('should call selectNewNode when the node is banned', () => {
			apiClient.banActiveNodeAndSelect();
			return expect(getNewNodeStub).toHaveBeenCalledTimes(1);
		});

		it('should not call selectNewNode when the node is not banned', () => {
			const bannedNodes = [currentNode];
			apiClient.bannedNodes = bannedNodes;
			apiClient.banActiveNodeAndSelect();
			return expect(getNewNodeStub).not.toHaveBeenCalled();
		});
	});

	describe('#isBanned', () => {
		it('should return true when provided node is banned', () => {
			apiClient.bannedNodes = [...apiClient.bannedNodes, localNode];
			return expect(apiClient.isBanned(localNode)).toBe(true);
		});

		it('should return false when provided node is not banned', () => {
			return expect(apiClient.isBanned(localNode)).toBe(false);
		});
	});

	describe('#hasAvailableNodes', () => {
		it('should return false without nodes left', () => {
			apiClient.bannedNodes = [...defaultNodes];
			const result = apiClient.hasAvailableNodes();
			return expect(result).toBe(false);
		});

		it('should return true if nodes are available', () => {
			const result = apiClient.hasAvailableNodes();
			return expect(result).toBe(true);
		});
	});
});
