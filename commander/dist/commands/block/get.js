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
			var args, blockIdsStr, blockIds, req, client, results;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						args = this.parse(GetCommand).args;
						blockIdsStr = args.blockIds;
						blockIds = blockIdsStr.split(',').filter(Boolean);
						req = blockIds.map(function(blockId) {
							return {
								query: {
									limit: 1,
									blockId: blockId,
								},
								placeholder: {
									id: blockId,
									message: 'Block not found.',
								},
							};
						});
						client = api_1.getAPIClient(this.userConfig.api);
						return [4, query_1.query(client, 'blocks', req)];
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
			name: 'blockIds',
			required: true,
			description: 'Comma-separated block ID(s) to get information about.',
		},
	];
	GetCommand.description =
		'\n\t\tGets block information from the blockchain.\n\t';
	GetCommand.examples = [
		'block:get 17108498772892203620',
		'block:get 17108498772892203620,8541428004955961162',
	];
	GetCommand.flags = tslib_1.__assign({}, base_1.default.flags);
	return GetCommand;
})(base_1.default);
exports.default = GetCommand;
//# sourceMappingURL=get.js.map
