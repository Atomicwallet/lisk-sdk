"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var base_1 = tslib_1.__importDefault(require("../base"));
var warranty = "\nTHERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW.\nEXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM \u201CAS IS\u201D WITHOUT WARRANTY OF ANY KIND,\nEITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.\nTHE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.\nSHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION.\n\nYou should have received a copy of the GNU General Public License\nalong with this program.  If not, see <https://www.gnu.org/licenses/>.\n".trim();
var WarrantyCommand = (function (_super) {
    tslib_1.__extends(WarrantyCommand, _super);
    function WarrantyCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WarrantyCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.print({ warranty: warranty });
                return [2];
            });
        });
    };
    WarrantyCommand.description = "\n\tDisplays warranty notice.\n\t";
    WarrantyCommand.examples = ['warranty'];
    WarrantyCommand.flags = tslib_1.__assign({}, base_1.default.flags);
    return WarrantyCommand;
}(base_1.default));
exports.default = WarrantyCommand;
//# sourceMappingURL=warranty.js.map