'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var base_1 = tslib_1.__importDefault(require('../../base'));
var ShowCommand = (function(_super) {
	tslib_1.__extends(ShowCommand, _super);
	function ShowCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	ShowCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			return tslib_1.__generator(this, function(_a) {
				this.print(this.userConfig);
				return [2];
			});
		});
	};
	ShowCommand.description = '\n\t\tPrints the current configuration.\n\t';
	ShowCommand.examples = ['config:show'];
	ShowCommand.flags = tslib_1.__assign({}, base_1.default.flags);
	return ShowCommand;
})(base_1.default);
exports.default = ShowCommand;
//# sourceMappingURL=show.js.map
