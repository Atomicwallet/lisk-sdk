"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const fs_1 = require("fs");
const path_1 = require("path");
const env_1 = require("./bootstrapping/env");
class BaseBootstrapCommand extends command_1.Command {
    async finally(error) {
        if (error) {
            this.error(error instanceof Error ? error.message : error);
        }
    }
    async init() {
        const { flags } = this.parse(this.constructor);
        this.bootstrapFlags = flags;
        process.stdout.on('error', (err) => {
            if (err.errno !== 'EPIPE') {
                throw err;
            }
        });
    }
    _isLiskAppDir(path) {
        return fs_1.existsSync(path_1.join(path, '.liskrc.json'));
    }
    async _runBootstrapCommand(command, opts) {
        return new Promise(resolve => {
            env_1.env.run(command, { ...opts, template: this.bootstrapFlags.template, version: this.config.version }, (err) => {
                if (err) {
                    this.error(err);
                }
                return resolve();
            });
        });
    }
}
exports.default = BaseBootstrapCommand;
BaseBootstrapCommand.flags = {
    template: command_1.flags.string({
        char: 't',
        description: 'Template to bootstrap the application. It will read from `.liskrc.json` or use `lisk-ts` if not found.',
    }),
};
//# sourceMappingURL=base_bootstrap_command.js.map