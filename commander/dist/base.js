"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfigFolder = void 0;
const command_1 = require("@oclif/command");
const print_1 = require("./utils/print");
exports.defaultConfigFolder = '.lisk';
const jsonDescription = 'Prints output in JSON format. You can change the default behavior in your config.json file.';
const prettyDescription = 'Prints JSON in pretty format rather than condensed. Has no effect if the output is set to table. You can change the default behavior in your config.json file.';
class BaseCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.printFlags = {};
    }
    async finally(error) {
        if (error) {
            this.error(error instanceof Error ? error.message : error);
        }
    }
    async init() {
        const { flags } = this.parse(this.constructor);
        this.printFlags = flags;
        process.stdout.on('error', (err) => {
            if (err.errno !== 'EPIPE') {
                throw err;
            }
        });
    }
    print(result) {
        print_1.print({
            ...this.printFlags,
        }).call(this, result);
    }
}
exports.default = BaseCommand;
BaseCommand.flags = {
    json: command_1.flags.boolean({
        char: 'j',
        description: jsonDescription,
        allowNo: true,
    }),
    pretty: command_1.flags.boolean({
        description: prettyDescription,
        allowNo: true,
    }),
};
//# sourceMappingURL=base.js.map