"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableCommand = void 0;
const base_forging_1 = require("../base_forging");
class EnableCommand extends base_forging_1.BaseForgingCommand {
    async init() {
        await super.init();
        this.forging = true;
    }
}
exports.EnableCommand = EnableCommand;
EnableCommand.description = 'Enable forging for given delegate address.';
EnableCommand.examples = [
    'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10',
    'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --overwrite',
    'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data',
    'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data --password your_password',
];
EnableCommand.flags = {
    ...base_forging_1.BaseForgingCommand.flags,
};
EnableCommand.args = [
    ...base_forging_1.BaseForgingCommand.args,
    {
        name: 'height',
        required: true,
        description: 'Last forged block height.',
    },
    {
        name: 'maxHeightPreviouslyForged',
        required: true,
        description: 'Delegates largest previously forged height.',
    },
    {
        name: 'maxHeightPrevoted',
        required: true,
        description: 'Delegates largest prevoted height for a block.',
    },
];
//# sourceMappingURL=enable.js.map