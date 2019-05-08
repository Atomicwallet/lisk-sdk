'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var api_1 = require('../../utils/api');
var constants_1 = require('../../utils/constants');
var query_1 = require('../../utils/query');
var MAXIMUM_LIMIT = 100;
var DEFAULT_LIMIT = 10;
var DEFAULT_OFFSET = 0;
var DEFAULT_SORT = 'balance:desc';
var processFlagInputs = function(limitStr, offsetStr, sortStr) {
	var limit = parseInt(limitStr, 10);
	var offset = parseInt(offsetStr, 10);
	var sort = sortStr ? sortStr.trim() : undefined;
	if (limitStr !== limit.toString() || !Number.isInteger(limit) || limit <= 0) {
		throw new Error('Limit must be an integer and greater than 0');
	}
	if (limit && limit > MAXIMUM_LIMIT) {
		throw new Error('Maximum limit amount is ' + MAXIMUM_LIMIT);
	}
	if (
		offsetStr !== offset.toString() ||
		!Number.isInteger(offset) ||
		offset < 0
	) {
		throw new Error('Offset must be an integer and greater than or equal to 0');
	}
	if (sort !== undefined && !constants_1.SORT_FIELDS.includes(sort)) {
		throw new Error(
			'Sort must be one of: ' + constants_1.SORT_FIELDS.join(', '),
		);
	}
	return {
		limit: limit,
		offset: offset,
		sort: sort,
	};
};
var VotersCommand = (function(_super) {
	tslib_1.__extends(VotersCommand, _super);
	function VotersCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	VotersCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a,
				args,
				_b,
				limitStr,
				offsetStr,
				sortStr,
				usernamesStr,
				usernames,
				_c,
				limit,
				offset,
				sort,
				req,
				client,
				results;
			return tslib_1.__generator(this, function(_d) {
				switch (_d.label) {
					case 0:
						(_a = this.parse(VotersCommand)),
							(args = _a.args),
							(_b = _a.flags),
							(limitStr = _b.limit),
							(offsetStr = _b.offset),
							(sortStr = _b.sort);
						usernamesStr = args.usernames;
						usernames = usernamesStr.split(',').filter(Boolean);
						(_c = processFlagInputs(limitStr, offsetStr, sortStr)),
							(limit = _c.limit),
							(offset = _c.offset),
							(sort = _c.sort);
						req = usernames.map(function(username) {
							return {
								query: {
									username: username,
									limit: limit || DEFAULT_LIMIT,
									offset: offset || DEFAULT_OFFSET,
									sort: sort || DEFAULT_SORT,
								},
								placeholder: {
									username: username,
									message: 'Delegate not found.',
								},
							};
						});
						client = api_1.getAPIClient(this.userConfig.api);
						return [4, query_1.query(client, 'voters', req)];
					case 1:
						results = _d.sent();
						this.print(results);
						return [2];
				}
			});
		});
	};
	VotersCommand.args = [
		{
			name: 'usernames',
			required: true,
			description: 'Comma-separated username(s) to get information about.',
		},
	];
	VotersCommand.description =
		'\n\tGets voters information for given delegate(s) from the blockchain.\n\t';
	VotersCommand.examples = [
		'delegate:voters lightcurve',
		'delegate:voters lightcurve,4miners.net',
		'delegate:voters lightcurve,4miners.net --limit 20 --offset 5 --sort publicKey:asc --pretty',
	];
	VotersCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		limit: command_1.flags.string({
			description: 'Limit applied to results.',
			default: '10',
		}),
		offset: command_1.flags.string({
			description: 'Offset applied to results.',
			default: '0',
		}),
		sort: command_1.flags.string({
			description: 'Fields to sort results by.',
			default: DEFAULT_SORT,
		}),
	});
	return VotersCommand;
})(base_1.default);
exports.default = VotersCommand;
//# sourceMappingURL=voters.js.map
