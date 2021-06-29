"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCommand = void 0;
const command_1 = require("@oclif/command");
const cryptography = require("@liskhq/lisk-cryptography");
class ValidateCommand extends command_1.Command {
    async run() {
        const { args } = this.parse(ValidateCommand);
        const { address } = args;
        try {
            cryptography.validateBase32Address(address, this.config.pjson.lisk.addressPrefix);
            const binaryAddress = cryptography.getAddressFromBase32Address(address).toString('hex');
            this.log(`Address ${address} is a valid base32 address and the corresponding binary address is ${binaryAddress}.`);
        }
        catch (error) {
            this.error(error.message);
        }
    }
}
exports.ValidateCommand = ValidateCommand;
ValidateCommand.description = 'Validate base32 address.';
ValidateCommand.examples = ['account:validate lskoaknq582o6fw7sp82bm2hnj7pzp47mpmbmux2g'];
ValidateCommand.args = [
    {
        name: 'address',
        required: true,
        description: 'Address in base32 format to validate.',
    },
];
//# sourceMappingURL=validate.js.map