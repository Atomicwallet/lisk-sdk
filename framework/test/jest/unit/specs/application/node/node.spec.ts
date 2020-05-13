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

import { when } from 'jest-when';
import { BFT } from '@liskhq/lisk-bft';
import { Node } from '../../../../../../src/application/node/node';
import { Synchronizer } from '../../../../../../src/application/node/synchronizer/synchronizer';
import { Processor } from '../../../../../../src/application/node/processor';
import {
	Forger,
	HighFeeForgingStrategy,
} from '../../../../../../src/application/node/forger';
import { cacheConfig, nodeOptions } from '../../../../../fixtures/node';

const setProperty = (object: object, property: string, value: any) => {
	const originalProperty = Object.getOwnPropertyDescriptor(object, property);
	Object.defineProperty(object, property, { value });
	return originalProperty;
};

describe('Node', () => {
	let node: Node;
	let subscribedEvents: any;
	const stubs: any = {};
	const lastBlock = { ...nodeOptions.genesisBlock };
	const mockExit = jest.fn();

	beforeEach(() => {
		// Arrange
		subscribedEvents = {};
		setProperty(process, 'exit', mockExit);

		jest.spyOn(Processor.prototype, 'init').mockResolvedValue(undefined);
		jest.spyOn(Synchronizer.prototype, 'init').mockResolvedValue(undefined);

		/* Arranging Stubs start */
		stubs.logger = {
			trace: jest.fn(),
			error: jest.fn(),
			debug: jest.fn(),
			fatal: jest.fn(),
			info: jest.fn(),
			cleanup: jest.fn(),
		};

		stubs.cache = {
			cleanup: jest.fn(),
		};
		stubs.storage = {
			cleanup: jest.fn(),
			entities: {
				Block: {
					get: jest.fn().mockResolvedValue([]),
					count: jest.fn().mockResolvedValue(0),
				},
				ChainMeta: { getKey: jest.fn() },
			},
		};
		stubs.forgerDB = {
			get: jest.fn(),
			put: jest.fn(),
			close: jest.fn(),
		};
		stubs.modules = {
			module1: {
				cleanup: jest.fn().mockResolvedValue('module1cleanup'),
			},
			module2: {
				cleanup: jest.fn().mockResolvedValue('module2cleanup'),
			},
		};

		stubs.webSocket = {
			listen: jest.fn(),
			removeAllListeners: jest.fn(),
			destroy: jest.fn(),
		};

		stubs.channel = {
			invoke: jest.fn(),
			subscribe: jest.fn((event, cb) => {
				subscribedEvents[event] = cb;
			}),
			once: jest.fn(),
		};

		stubs.applicationState = {};

		when(stubs.channel.invoke)
			.calledWith('app:getComponentConfig', 'cache')
			.mockResolvedValue(cacheConfig as never);

		when(stubs.storage.entities.Block.get)
			.calledWith({}, { sort: 'height:desc', limit: 1, extended: true })
			.mockResolvedValue(lastBlock as never);

		// Act
		const params = {
			channel: stubs.channel,
			storage: stubs.storage,
			forgerDB: stubs.forgerDB,
			logger: stubs.logger,
			options: nodeOptions,
			applicationState: stubs.applicationState,
		};

		node = new Node(params as any);
	});

	describe('constructor', () => {
		it('should accept channel as first parameter and assign to object instance', () => {
			// Assert
			return expect(node['_channel']).toEqual(stubs.channel);
		});
		it('should accept options as second parameter and assign to object instance', () => {
			// Assert
			return expect(node['_options']).toEqual(nodeOptions);
		});
		it('should initialize class properties', () => {
			expect(node['_logger']).toEqual(stubs.logger);
			expect(node['_storage']).toEqual(stubs.storage);
			expect(node['_channel']).toEqual(stubs.channel);
			expect(node['_components']).not.toBeUndefined();
			expect(node['_sequence']).toBeUndefined();
		});
	});

	describe('bootstrap', () => {
		beforeEach(async () => {
			// Act
			await node.bootstrap();
		});

		it('should be an async function', () => {
			return expect(node.bootstrap.constructor.name).toEqual('AsyncFunction');
		});

		describe('when options.rebuildUpToRound is set to an integer value', () => {
			beforeEach(async () => {
				// Arrange
				node = new Node({
					channel: {
						invoke: jest.fn(),
						subscribe: jest.fn((event, cb) => {
							subscribedEvents[event] = cb;
						}),
						once: jest.fn(),
					},
					options: {
						...nodeOptions,
						rebuildUpToRound: 0,
					},
					logger: stubs.logger,
					storage: stubs.storage,
				} as any);

				// Act
				await node.bootstrap();
			});

			it('should not subscribe to event', () => {
				return expect(node['_channel'].subscribe).not.toHaveBeenCalledWith(
					'app:block:broadcast',
					expect.anything(),
				);
			});
		});

		it('should throw error when genesisBlock option is not provided', async () => {
			// Arrange
			node = new Node({
				channel: stubs.channel,
				logger: stubs.logger,
				options: { ...nodeOptions, genesisBlock: null },
			} as any);

			// Act
			await node.bootstrap();

			// Assert
			expect(node['_logger'].fatal).toHaveBeenCalledTimes(1);
			expect(node['_logger'].fatal).toHaveBeenCalledWith(
				expect.objectContaining({ message: 'Missing genesis block' }),
				'Failed to initialization node',
			);
		});

		it('should throw error when waitThreshold is greater than blockTime', async () => {
			const invalidChainOptions = {
				...nodeOptions,
				forging: {
					waitThreshold: 5,
				},
				constants: {
					blockTime: 4,
				},
			};

			node = new Node({
				channel: stubs.channel,
				options: invalidChainOptions,
				logger: stubs.logger,
			} as any);

			await node.bootstrap();

			expect(node['_logger'].fatal).toHaveBeenCalledTimes(1);
			// Ignoring the error object as its non-deterministic
			expect(node['_logger'].fatal).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.stringContaining(
						'forging.waitThreshold=5 is greater or equal to genesisConfig.blockTime=4',
					),
				}),
				'Failed to initialization node',
			);
		});

		it('should throw error when waitThreshold is same as blockTime', async () => {
			const invalidChainOptions = {
				...nodeOptions,
				forging: {
					waitThreshold: 5,
				},
				constants: {
					blockTime: 5,
				},
			};

			node = new Node({
				channel: stubs.channel,
				options: invalidChainOptions,
				logger: stubs.logger,
			} as any);

			await node.bootstrap();

			expect(node['_logger'].fatal).toHaveBeenCalledTimes(1);
			expect(node['_logger'].fatal).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.stringContaining(
						'forging.waitThreshold=5 is greater or equal to genesisConfig.blockTime=5',
					),
				}),
				'Failed to initialization node',
			);
		});

		it('should initialize scope object with valid structure', () => {
			expect(node).toHaveProperty('_options');
			expect(node).toHaveProperty('_sequence');
			expect(node).toHaveProperty('_channel');
			expect(node).toHaveProperty('_applicationState');
			expect(node).toHaveProperty('_networkIdentifier');
		});

		describe('_initModules', () => {
			it('should initialize bft module', () => {
				expect(node['_bft']).toBeInstanceOf(BFT);
			});

			it('should initialize forger module', () => {
				expect(node['_forger']).toBeInstanceOf(Forger);
			});

			it('should initialize forger module with high fee strategy', () => {
				expect(node['_forger']['_forgingStrategy']).toBeInstanceOf(
					HighFeeForgingStrategy,
				);
			});
		});

		it('should invoke Processor.init', () => {
			expect(node['_processor'].init).toHaveBeenCalledTimes(1);
		});

		it('should invoke "app:updateApplicationState" with correct params', () => {
			// Assert
			return expect(node['_channel'].invoke).toHaveBeenCalledWith(
				'app:updateApplicationState',
				{
					height: lastBlock.height,
					blockVersion: lastBlock.version,
					maxHeightPrevoted: 0,
					lastBlockId: lastBlock.id,
				},
			);
		});

		it('should subscribe to "app:state:updated" event', () => {
			return expect(node['_channel'].subscribe).toHaveBeenCalledWith(
				'app:state:updated',
				expect.any(Function),
			);
		});

		it('should subscribe to "network:subscribe" event', () => {
			return expect(node['_channel'].subscribe).toHaveBeenCalledWith(
				'app:network:event',
				expect.any(Function),
			);
		});

		it('should start transaction pool', () => {
			jest.spyOn(node['_transactionPool'], 'start');
			subscribedEvents['app:ready']();
			return expect(node['_transactionPool'].start).toHaveBeenCalled();
		});

		describe('if any error thrown', () => {
			beforeEach(async () => {
				// Arrange
				node = new Node({
					channel: stubs.channel,
					options: {
						...nodeOptions,
						genesisBlock: null,
					},
					logger: stubs.logger,
					storage: stubs.storage,
				} as any);

				// Act
				try {
					await node.bootstrap();
				} catch (e) {
					// ignore
				}
			});

			it('should log "Failed to initialization node module"', () => {
				expect(node['_logger'].fatal).toHaveBeenCalledWith(
					expect.any(Object),
					'Failed to initialization node',
				);
			});
			it('should emit an event "beforeExit" on the process', () => {
				return expect(mockExit).toHaveBeenCalledWith(0);
			});
		});
	});

	describe('beforeExit', () => {
		beforeEach(async () => {
			// Arrange
			await node.bootstrap();
		});

		it('should be an async function', () => {
			// Assert
			return expect(node.cleanup.constructor.name).toEqual('AsyncFunction');
		});

		it('should call transactionPool.stop', async () => {
			jest.spyOn(node['_transactionPool'], 'stop');
			await node.cleanup();
			// Assert
			expect(node['_transactionPool'].stop).toHaveBeenCalled();
		});
	});

	describe('#_forgingTask', () => {
		beforeEach(async () => {
			await node.bootstrap();
			jest.spyOn(node['_forger'], 'delegatesEnabled').mockReturnValue(true);
			jest.spyOn(node['_forger'], 'forge');
			jest.spyOn(node['_sequence'], 'add').mockImplementation(async fn => {
				await fn();
			});
			jest
				.spyOn(node['_synchronizer'], 'isActive', 'get')
				.mockReturnValue(false);
		});

		it('should halt if no delegates are enabled', async () => {
			// Arrange
			(node['_forger'].delegatesEnabled as jest.Mock).mockReturnValue(false);

			// Act
			await node['_forgingTask']();

			// Assert
			expect(stubs.logger.trace).toHaveBeenNthCalledWith(
				1,
				'No delegates are enabled',
			);
			expect(node['_sequence'].add).toHaveBeenCalled();
			expect(node['_forger'].forge).not.toHaveBeenCalled();
		});

		it('should halt if the client is not ready to forge (is syncing)', async () => {
			// Arrange
			jest
				.spyOn(node['_synchronizer'], 'isActive', 'get')
				.mockReturnValue(true);

			// Act
			await node['_forgingTask']();

			// Assert
			expect(stubs.logger.debug).toHaveBeenNthCalledWith(
				1,
				'Client not ready to forge',
			);
			expect(node['_sequence'].add).toHaveBeenCalled();
			expect(node['_forger'].forge).not.toHaveBeenCalled();
		});

		it('should execute forger.forge otherwise', async () => {
			await node['_forgingTask']();

			expect(node['_sequence'].add).toHaveBeenCalled();
			expect(node['_forger'].forge).toHaveBeenCalled();
		});
	});

	describe('#_startForging', () => {
		beforeEach(async () => {
			await node.bootstrap();
			jest.spyOn(node['_forger'], 'loadDelegates');
		});

		it('should load the delegates', async () => {
			await node['_startForging']();
			expect(node['_forger'].loadDelegates).toHaveBeenCalled();
		});

		it('should register a task in Jobs Queue named "nextForge" with a designated interval', async () => {
			await node['_startForging']();

			expect(node['_forgingJob']).not.toBeUndefined();
		});
	});
});
