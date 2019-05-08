'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var base_1 = tslib_1.__importDefault(require('../../base'));
var api_1 = require('../../utils/api');
var query_1 = require('../../utils/query');
var GetCommand = (function(_super) {
	tslib_1.__extends(GetCommand, _super);
	function GetCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	GetCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var args, addressesStr, addresses, req, client, results;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						args = this.parse(GetCommand).args;
						addressesStr = args.addresses;
						addresses = addressesStr.split(',').filter(Boolean);
						req = addresses.map(function(address) {
							return {
								query: {
									limit: 1,
									address: address,
								},
								placeholder: {
									address: address,
									message: 'Address not found.',
								},
							};
						});
						client = api_1.getAPIClient(this.userConfig.api);
						return [4, query_1.query(client, 'accounts', req)];
					case 1:
						results = _a.sent();
						this.print(results);
						return [2];
				}
			});
		});
	};
	GetCommand.args = [
		{
			name: 'addresses',
			required: true,
			description: 'Comma-separated address(es) to get information about.',
		},
	];
	GetCommand.description =
		'\n\t\tGets account information from the blockchain.\n\t';
	GetCommand.examples = [
		'account:get 3520445367460290306L',
		'account:get 3520445367460290306L,2802325248134221536L',
	];
	GetCommand.flags = tslib_1.__assign({}, base_1.default.flags);
	return GetCommand;
})(base_1.default);
exports.default = GetCommand;
//# sourceMappingURL=get.js.map
