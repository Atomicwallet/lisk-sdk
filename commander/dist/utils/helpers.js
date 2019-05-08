'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var error_1 = require('../utils/error');
var regExpAmount = /^\d+(\.\d{1,8})?$/;
var isStringInteger = function(n) {
	var parsed = parseInt(n, 10);
	return !Number.isNaN(parsed) && parsed.toString() === n;
};
exports.validateLifetime = function(lifetime) {
	if (!isStringInteger(lifetime)) {
		throw new error_1.ValidationError('Lifetime must be an integer.');
	}
	return true;
};
exports.validateMinimum = function(minimum) {
	if (!isStringInteger(minimum)) {
		throw new error_1.ValidationError(
			'Minimum number of signatures must be an integer.',
		);
	}
	return true;
};
exports.validateAmount = function(amount) {
	if (!amount.match(regExpAmount)) {
		throw new error_1.ValidationError(
			'Amount must be a number with no more than 8 decimal places.',
		);
	}
	return true;
};
exports.createErrorHandler = function(prefix) {
	return function(_a) {
		var message = _a.message;
		return {
			error: prefix + ': ' + message,
		};
	};
};
exports.handleEPIPE = function(err) {
	if (err.errno !== 'EPIPE') {
		throw err;
	}
};
exports.stdoutIsTTY = function() {
	return process.stdout.isTTY;
};
exports.stdinIsTTY = function() {
	return process.stdin.isTTY;
};
//# sourceMappingURL=helpers.js.map
