'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var command_1 = require('@oclif/command');
var base_1 = tslib_1.__importDefault(require('../../base'));
var flags_1 = require('../../utils/flags');
var delegate_1 = tslib_1.__importDefault(require('./create/delegate'));
var multisignature_1 = tslib_1.__importDefault(
	require('./create/multisignature'),
);
var second_passphrase_1 = tslib_1.__importDefault(
	require('./create/second-passphrase'),
);
var transfer_1 = tslib_1.__importDefault(require('./create/transfer'));
var vote_1 = tslib_1.__importDefault(require('./create/vote'));
var MAX_ARG_NUM = 3;
var typeNumberMap = {
	'0': 'transfer',
	'1': 'second-passphrase',
	'2': 'delegate',
	'3': 'vote',
	'4': 'multisignature',
};
var options = Object.entries(typeNumberMap).reduce(function(accumulated, _a) {
	var _b = tslib_1.__read(_a, 2),
		key = _b[0],
		value = _b[1];
	return tslib_1.__spread(accumulated, [key, value]);
}, []);
var typeClassMap = {
	transfer: transfer_1.default,
	'second-passphrase': second_passphrase_1.default,
	vote: vote_1.default,
	delegate: delegate_1.default,
	multisignature: multisignature_1.default,
};
var resolveFlags = function(accumulated, _a) {
	var _b = tslib_1.__read(_a, 2),
		key = _b[0],
		value = _b[1];
	if (key === 'type') {
		return accumulated;
	}
	if (typeof value === 'string') {
		return tslib_1.__spread(accumulated, ['--' + key, value]);
	}
	var boolKey = value === false ? '--no-' + key : '--' + key;
	return tslib_1.__spread(accumulated, [boolKey]);
};
var CreateCommand = (function(_super) {
	tslib_1.__extends(CreateCommand, _super);
	function CreateCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	CreateCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var _a, argv, flags, type, commandType, resolvedFlags;
			return tslib_1.__generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						(_a = this.parse(CreateCommand)),
							(argv = _a.argv),
							(flags = _a.flags);
						type = flags.type;
						commandType = Object.keys(typeNumberMap).includes(type)
							? typeNumberMap[type]
							: type;
						resolvedFlags = Object.entries(flags).reduce(resolveFlags, []);
						return [
							4,
							typeClassMap[commandType].run(
								tslib_1.__spread(argv, resolvedFlags),
							),
						];
					case 1:
						_b.sent();
						return [2];
				}
			});
		});
	};
	CreateCommand.args = new Array(MAX_ARG_NUM).fill(0).map(function(i) {
		return {
			name: i + '_arg',
		};
	});
	CreateCommand.description = '\n\tCreates a transaction object.\n\t';
	CreateCommand.examples = [
		'transaction:create --type=0 100 13356260975429434553L',
		'transaction:create --type=delegate lightcurve',
	];
	CreateCommand.flags = tslib_1.__assign({}, base_1.default.flags, {
		type: command_1.flags.string({
			char: 't',
			description: 'type of transaction to create',
			required: true,
			options: options,
		}),
		passphrase: command_1.flags.string(flags_1.flags.passphrase),
		'second-passphrase': command_1.flags.string(flags_1.flags.secondPassphrase),
		'no-signature': command_1.flags.boolean(flags_1.flags.noSignature),
		votes: command_1.flags.string(flags_1.flags.votes),
		unvotes: command_1.flags.string(flags_1.flags.unvotes),
	});
	return CreateCommand;
})(base_1.default);
exports.default = CreateCommand;
//# sourceMappingURL=create.js.map
