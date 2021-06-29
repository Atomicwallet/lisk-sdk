"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowCommand = void 0;
const cryptography = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const flags_1 = require("../../../utils/flags");
const reader_1 = require("../../../utils/reader");
const processInput = (passphrase, prefix) => {
    const { privateKey, publicKey } = cryptography.getKeys(passphrase);
    const binaryAddress = cryptography.getAddressFromPublicKey(publicKey);
    const address = cryptography.getBase32AddressFromPublicKey(publicKey, prefix);
    return {
        privateKey: privateKey.toString('hex'),
        publicKey: publicKey.toString('hex'),
        address,
        binaryAddress: binaryAddress.toString('hex'),
    };
};
class ShowCommand extends command_1.Command {
    async run() {
        const { flags: { passphrase: passphraseSource }, } = this.parse(ShowCommand);
        const passphrase = passphraseSource !== null && passphraseSource !== void 0 ? passphraseSource : (await reader_1.getPassphraseFromPrompt('passphrase', true));
        this.log(JSON.stringify(processInput(passphrase, this.config.pjson.lisk.addressPrefix), undefined, ' '));
    }
}
exports.ShowCommand = ShowCommand;
ShowCommand.description = 'Show account information for a given passphrase.';
ShowCommand.examples = ['account:show'];
ShowCommand.flags = {
    passphrase: flags_1.flagsWithParser.passphrase,
};
//# sourceMappingURL=show.js.map