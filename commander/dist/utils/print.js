'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var strip_ansi_1 = tslib_1.__importDefault(require('strip-ansi'));
var tablify_1 = require('./tablify');
var removeANSIFromObject = function(object) {
	return Object.entries(object).reduce(function(strippedResult, _a) {
		var _b = tslib_1.__read(_a, 2),
			key = _b[0],
			value = _b[1];
		var _c;
		return tslib_1.__assign(
			{},
			strippedResult,
			((_c = {}), (_c[key] = strip_ansi_1.default(value)), _c),
		);
	}, {});
};
var isStringMapArray = function(result) {
	return Array.isArray(result);
};
var removeANSI = function(result) {
	return isStringMapArray(result)
		? result.map(removeANSIFromObject)
		: removeANSIFromObject(result);
};
exports.print = function(_a) {
	var _b = _a === void 0 ? {} : _a,
		json = _b.json,
		pretty = _b.pretty;
	return function printResult(result) {
		var resultToPrint = json ? removeANSI(result) : result;
		var output = json
			? JSON.stringify(resultToPrint, undefined, pretty ? '\t' : undefined)
			: tablify_1.tablify(resultToPrint).toString();
		var logger = this && this.log ? this : console;
		logger.log(output);
	};
};
//# sourceMappingURL=print.js.map
