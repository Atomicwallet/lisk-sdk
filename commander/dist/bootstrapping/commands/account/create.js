"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommand = void 0;
const command_1 = require("@oclif/command");
const cryptography = require("@liskhq/lisk-cryptography");
const passphrase = require("@liskhq/lisk-passphrase");
const createAccount = (prefix) => {
    const generatedPassphrase = passphrase.Mnemonic.generateMnemonic();
    const { privateKey, publicKey } = cryptography.getKeys(generatedPassphrase);
    const binaryAddress = cryptography.getAddressFromPublicKey(publicKey);
    const address = cryptography.getBase32AddressFromPublicKey(publicKey, prefix);
    return {
        passphrase: generatedPassphrase,
        privateKey: privateKey.toString('hex'),
        publicKey: publicKey.toString('hex'),
        binaryAddress: binaryAddress.toString('hex'),
        address,
    };
};
class CreateCommand extends command_1.Command {
    async run() {
        const { flags: { count }, } = this.parse(CreateCommand);
        const numberOfAccounts = parseInt(count, 10);
        if (count !== numberOfAccounts.toString() ||
            !Number.isInteger(numberOfAccounts) ||
            numberOfAccounts <= 0) {
            throw new Error('Count flag must be an integer and greater than 0.');
        }
        const accounts = new Array(numberOfAccounts)
            .fill(0)
            .map(() => createAccount(this.config.pjson.lisk.addressPrefix));
        this.log(JSON.stringify(accounts, undefined, ' '));
    }
}
exports.CreateCommand = CreateCommand;
CreateCommand.description = 'Return randomly-generated mnemonic passphrase with its corresponding public/private key pair and Lisk address.';
CreateCommand.examples = ['account:create', 'account:create --count=3'];
CreateCommand.flags = {
    count: command_1.flags.string({
        char: 'c',
        description: 'Number of accounts to create.',
        default: '1',
    }),
};
//# sourceMappingURL=create.js.map