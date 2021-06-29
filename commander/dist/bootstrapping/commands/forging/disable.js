"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisableCommand = void 0;
const base_forging_1 = require("../base_forging");
class DisableCommand extends base_forging_1.BaseForgingCommand {
    async init() {
        await super.init();
        this.forging = false;
    }
}
exports.DisableCommand = DisableCommand;
DisableCommand.description = 'Disable forging for given delegate address.';
DisableCommand.examples = [
    'forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
    'forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --data-path ./data',
    'forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --data-path ./data --password your_password',
];
DisableCommand.flags = {
    ...base_forging_1.BaseForgingCommand.flags,
};
DisableCommand.args = [...base_forging_1.BaseForgingCommand.args];
//# sourceMappingURL=disable.js.map