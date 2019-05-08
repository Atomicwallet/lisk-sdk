'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lisk_framework_1 = require('lisk-framework');
var path_1 = tslib_1.__importDefault(require('path'));
var packageJSON = require('../../package.json');
var appSchema = {
	type: 'object',
	properties: {
		NETWORK: {
			type: 'string',
			description:
				'lisk network [devnet|betanet|mainnet|testnet]. Defaults to "devnet"',
			enum: ['devnet', 'alphanet', 'betanet', 'testnet', 'mainnet'],
			env: 'LISK_NETWORK',
			arg: '--network,-n',
		},
		CUSTOM_CONFIG_FILE: {
			type: ['string', 'null'],
			description: 'Custom configuration file path',
			default: null,
			env: 'LISK_CONFIG_FILE',
			arg: '--config,-c',
		},
	},
	default: {
		NETWORK: 'devnet',
		CUSTOM_CONFIG_FILE: null,
	},
};
lisk_framework_1.configurator.registerSchema(appSchema);
var appConfig = {
	app: {
		version: packageJSON.version,
		minVersion: packageJSON.lisk.minVersion,
		protocolVersion: packageJSON.lisk.protocolVersion,
	},
};
if (process.env.NODE_ENV === 'test' && process.env.PROTOCOL_VERSION) {
	appConfig.app.protocolVersion = process.env.PROTOCOL_VERSION;
}
lisk_framework_1.configurator.loadConfig(appConfig);
var _a = lisk_framework_1.configurator.getConfig(),
	NETWORK = _a.NETWORK,
	CUSTOM_CONFIG_FILE = _a.CUSTOM_CONFIG_FILE;
process.env.LISK_NETWORK = NETWORK;
lisk_framework_1.configurator.loadConfigFile(
	path_1.default.resolve(__dirname, '../../config/' + NETWORK + '/config')
);
if (CUSTOM_CONFIG_FILE) {
	lisk_framework_1.configurator.loadConfigFile(
		path_1.default.resolve(CUSTOM_CONFIG_FILE)
	);
}
var config = lisk_framework_1.configurator.getConfig();
exports.config = config;
config.app.label = 'lisk-' + NETWORK + '-' + config.modules.http_api.httpPort;
//# sourceMappingURL=config.js.map
