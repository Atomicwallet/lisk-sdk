'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var base_1 = tslib_1.__importDefault(require('../../base'));
var pm2_1 = require('../../utils/core/pm2');
var StatusCommand = (function(_super) {
	tslib_1.__extends(StatusCommand, _super);
	function StatusCommand() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	StatusCommand.prototype.run = function() {
		return tslib_1.__awaiter(this, void 0, void 0, function() {
			var args, name, instance, instances, toDisplay_1, filtered;
			return tslib_1.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						args = this.parse(StatusCommand).args;
						name = args.name;
						if (!name) return [3, 2];
						return [4, pm2_1.describeApplication(name)];
					case 1:
						instance = _a.sent();
						this.print(instance);
						return [3, 4];
					case 2:
						return [4, pm2_1.listApplication()];
					case 3:
						instances = _a.sent();
						if (!instances.length) {
							this.log(
								'Lisk Core instances not available, use lisk core:install --help',
							);
						} else {
							toDisplay_1 = [
								'name',
								'status',
								'network',
								'version',
								'started_at',
								'cpu',
								'memory',
							];
							filtered = instances.map(function(instance) {
								return Object.keys(instance).reduce(function(newObj, key) {
									var _a;
									return toDisplay_1.includes(key)
										? tslib_1.__assign(
												{},
												newObj,
												((_a = {}), (_a[key] = instance[key]), _a),
										  )
										: newObj;
								}, {});
							});
							this.print(filtered);
						}
						_a.label = 4;
					case 4:
						return [2];
				}
			});
		});
	};
	StatusCommand.args = [
		{
			name: 'name',
			description: 'Lisk Core installation directory name.',
			required: false,
		},
	];
	StatusCommand.description = 'Show the status of a Lisk Core instances.';
	StatusCommand.examples = ['core:status', 'core:status mainnet-latest'];
	return StatusCommand;
})(base_1.default);
exports.default = StatusCommand;
//# sourceMappingURL=status.js.map
