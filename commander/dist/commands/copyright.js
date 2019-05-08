'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var base_1 = tslib_1.__importDefault(require('../base'));
var copyright = '\nLisk Commander  Copyright (C) 2017\u20132018  Lisk Foundation\n\nThis program is free software: you can redistribute it and/or modify\nit under the terms of the GNU General Public License as published by\nthe Free Software Foundation, either version 3 of the License, or\n(at your option) any later version.\n\nThis program is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\nGNU General Public License for more details.\n\nYou should have received a copy of the GNU General Public License\nalong with this program.  If not, see <https://www.gnu.org/licenses/>.\n'.trim();
var CopyrightCommand = (function(_super) {
	tslib_1.__extends(CopyrightCommand, _super);
	function CopyrightCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	CopyrightCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			return tslib_1.__generator(this, function(_a) {
				this.print({ copyright: copyright });
				return [2];
			});
		});
	};
	CopyrightCommand.description = '\n\tDisplays copyright notice.\n\t';
	CopyrightCommand.examples = ['copyright'];
	CopyrightCommand.flags = tslib_1.__assign({}, base_1.default.flags);
	return CopyrightCommand;
})(base_1.default);
exports.default = CopyrightCommand;
//# sourceMappingURL=copyright.js.map
