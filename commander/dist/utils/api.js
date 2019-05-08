'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var lisk_api_client_1 = require('@liskhq/lisk-api-client');
var constants_1 = require('./constants');
var seedNodes = {
	main: lisk_api_client_1.APIClient.constants.MAINNET_NODES,
	test: lisk_api_client_1.APIClient.constants.TESTNET_NODES,
};
exports.getAPIClient = function(_a) {
	var nodes = _a.nodes,
		network = _a.network;
	var nethash = constants_1.NETHASHES[network] || network;
	var clientNodes = nodes && nodes.length > 0 ? nodes : seedNodes[network];
	return new lisk_api_client_1.APIClient(clientNodes, { nethash: nethash });
};
//# sourceMappingURL=api.js.map
