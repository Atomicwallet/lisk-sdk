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
 */

jest.mock('fs-extra');
jest.mock('../../../../../src/controller/bus');
jest.mock('../../../../../src/controller/channels/in_memory_channel');

/* eslint-disable import/first  */

import * as fs from 'fs-extra';
import { Controller } from '../../../../../src/controller/controller';
import { Bus } from '../../../../../src/controller/bus';

const createMockModule = (alias: string, loadStub?: any, unloadStub?: any) => {
	function Module(this: any) {
		this.load = loadStub ?? jest.fn();
		this.unload = unloadStub ?? jest.fn();
		this.defaults = {};
		this.events = [];
		this.actions = {};
	}

	Module.info = {
		name: alias || 'dummy',
		version: 'dummy',
		author: 'dummy',
	};
	Module.alias = alias ?? 'dummy';

	return Module;
};
describe('Controller Class', () => {
	// Arrange
	const appLabel = '#LABEL';
	const logger = {
		debug: jest.fn(),
		info: jest.fn(),
		error: jest.fn(),
		trace: jest.fn(),
		fatal: jest.fn(),
		warn: jest.fn(),
		level: jest.fn(),
	};
	const storage: any = {
		entities: {
			Migration: {
				applyAll: jest.fn(),
			},
		},
	};
	const channel: any = {
		registerToBus: jest.fn(),
	};
	const config = {
		tempPath: '/tmp/lisk',
		ipc: {
			enabled: false,
		},
	};
	const systemDirs = {
		temp: `${config.tempPath}/${appLabel}/`,
		sockets: `${config.tempPath}/${appLabel}/sockets`,
		pids: `${config.tempPath}/${appLabel}/pids`,
	};
	const configController = {
		tempPath: '/tmp/lisk/#LABEL/',
		ipc: {
			enabled: false,
		},
		dirs: systemDirs,
		socketsPath: {
			root: `unix://${systemDirs.sockets}`,
			pub: `unix://${systemDirs.sockets}/lisk_pub.sock`,
			sub: `unix://${systemDirs.sockets}/lisk_sub.sock`,
			rpc: `unix://${systemDirs.sockets}/lisk_rpc.sock`,
		},
	};

	const params = {
		appLabel,
		config,
		logger,
		storage,
		channel,
	};

	let controller: Controller;

	beforeEach(() => {
		// Arrange
		jest.spyOn(fs, 'readdirSync').mockReturnValue([]);
		// Act
		controller = new Controller(params);
	});

	afterEach(async () => {
		// Act
		await controller.cleanup();
	});

	describe('#constructor', () => {
		it('should initialize the instance correctly when valid arguments were provided.', () => {
			// Assert
			expect(controller.logger).toEqual(logger);
			expect(controller.appLabel).toEqual(appLabel);
			expect(controller.config).toEqual(configController);
			expect(controller.modules).toEqual({});
			expect(controller.channel).toBe(channel);
			expect(controller.storage).toBe(storage);
			expect(controller.bus).toBeUndefined();
		});
	});

	describe('#load', () => {
		let modules: any;
		let moduleOptions: any;

		beforeEach(async () => {
			modules = {
				dummyModule1: createMockModule('dummyModule1'),
				dummyModule2: createMockModule('dummyModule2'),
				dummyModule3: createMockModule('dummyModule3'),
			};

			moduleOptions = {
				dummyModule1: '#OPTIONS1',
				dummyModule2: '#OPTIONS2',
				dummyModule3: '#OPTIONS3',
			};

			await controller.load(modules, moduleOptions, {});
		});

		describe('_setupDirectories', () => {
			it('should ensure directory exists', async () => {
				// Arrange
				jest.spyOn(fs, 'ensureDir');

				// Assert
				expect(fs.ensureDir).toHaveBeenCalledWith(controller.config.dirs.temp);
				expect(fs.ensureDir).toHaveBeenCalledWith(
					controller.config.dirs.sockets,
				);
				expect(fs.ensureDir).toHaveBeenCalledWith(controller.config.dirs.pids);
			});
		});

		describe('_validatePidFile', () => {
			it('should write process id to pid file if pid file not exits', async () => {
				// eslint-disable-next-line
				// @ts-ignore
				jest.spyOn(fs, 'pathExists').mockResolvedValue(false);
				jest.spyOn(fs, 'writeFile');

				expect(fs.writeFile).toBeCalledWith(
					`${controller.config.dirs.pids}/controller.pid`,
					expect.toBeNumber(),
				);
			});

			it.todo('should check if process is running if pid file exists');
			it.todo('should throw error if process for same app is running already');
		});

		describe('_setupBus', () => {
			it('should set created `Bus` instance to `controller.bus` property.', () => {
				// Assert
				expect(Bus).toHaveBeenCalledWith(
					{
						wildcard: true,
						delimiter: ':',
						maxListeners: 1000,
					},
					logger,
					configController,
				);
				expect(controller.bus).toBeInstanceOf(Bus);
			});

			it('should call `controller.bus.setup()` method.', () => {
				// Assert
				expect(controller.bus?.setup).toHaveBeenCalled();
			});

			it('should call `controller.channel.registerToBus()` method.', () => {
				// Assert
				expect(controller.bus?.setup).toHaveBeenCalled();
			});

			it.todo('should log events if level is greater than info.');
		});

		describe('_loadMigrations', () => {
			it.todo('should load migrations.');
		});

		describe('_loadModules', () => {
			it.todo('should load modules in sequence');
			it.todo('should call validateModuleSpec function.');

			describe('when creating channel', () => {
				it.todo(
					'should add created channel to `controller.modulesChannel` object',
				);

				it.todo(
					'should call `channel.registerToBus` method to register channel to the Bus.',
				);
			});

			describe('when creating module', () => {
				it.todo(
					'should publish `loading:started` event before loading module.',
				);
				it.todo('should call `module.load` method.');
				it.todo(
					'should publish `loading:finished` event after loading module.',
				);
				it.todo('should add module to `controller.modules` object.');
			});
		});

		it('should log registered events and actions', async () => {
			// Assert
			expect(logger.debug).toHaveBeenCalledWith(
				undefined,
				'Bus listening to events',
			);
			expect(logger.debug).toHaveBeenCalledWith(
				undefined,
				'Bus ready for actions',
			);
		});
	});

	describe('#unloadModules', () => {
		let loadStubs: any;
		let unloadStubs: any;

		beforeEach(async () => {
			// Arrange
			loadStubs = {
				module1: jest.fn(),
				module2: jest.fn(),
			};

			unloadStubs = {
				module1: jest.fn(),
				module2: jest.fn(),
			};

			const modules: any = {
				module1: createMockModule(
					'module1',
					loadStubs.module1,
					unloadStubs.module1,
				),
				module2: createMockModule(
					'module2',
					loadStubs.module2,
					unloadStubs.module2,
				),
			};
			const moduleOptions: any = {
				module1: {
					loadAsChildProcess: false,
				},
				module2: {
					loadAsChildProcess: false,
				},
			};

			await controller.load(modules, moduleOptions);
		});

		it('should unload modules in sequence', async () => {
			// Act
			await controller.unloadModules();

			// Assert
			expect(unloadStubs.module1).toHaveBeenCalled();
			expect(unloadStubs.module2).toHaveBeenCalled();
			expect(unloadStubs.module2).toHaveBeenCalledAfter(unloadStubs.module1);
		});

		it('should unload all modules if modules argument was not provided', async () => {
			// Act
			await controller.unloadModules();

			// Assert
			expect(controller.modules).toEqual({});
		});

		it('should unload given modules if modules argument was provided', async () => {
			// Act
			await controller.unloadModules(['module2']);

			// Assert
			expect(Object.keys(controller.modules)).toEqual(['module1']);
		});
	});
});
