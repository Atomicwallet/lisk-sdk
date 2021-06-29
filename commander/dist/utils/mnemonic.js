"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidMnemonicPassphrase = exports.createMnemonicPassphrase = void 0;
const lisk_passphrase_1 = require("@liskhq/lisk-passphrase");
exports.createMnemonicPassphrase = lisk_passphrase_1.Mnemonic.generateMnemonic;
exports.isValidMnemonicPassphrase = lisk_passphrase_1.Mnemonic.validateMnemonic;
//# sourceMappingURL=mnemonic.js.map