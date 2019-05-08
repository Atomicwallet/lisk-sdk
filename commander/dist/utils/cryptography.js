'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var cryptography = tslib_1.__importStar(require('@liskhq/lisk-cryptography'));
exports.encryptMessage = function(_a) {
	var message = _a.message,
		passphrase = _a.passphrase,
		recipient = _a.recipient;
	return cryptography.encryptMessageWithPassphrase(
		message,
		passphrase,
		recipient,
	);
};
exports.decryptMessage = function(_a) {
	var cipher = _a.cipher,
		nonce = _a.nonce,
		passphrase = _a.passphrase,
		senderPublicKey = _a.senderPublicKey;
	return {
		message: cryptography.decryptMessageWithPassphrase(
			cipher,
			nonce,
			passphrase,
			senderPublicKey,
		),
	};
};
exports.encryptPassphrase = function(_a) {
	var passphrase = _a.passphrase,
		password = _a.password;
	var encryptedPassphraseObject = cryptography.encryptPassphraseWithPassword(
		passphrase,
		password,
	);
	var encryptedPassphrase = cryptography.stringifyEncryptedPassphrase(
		encryptedPassphraseObject,
	);
	return { encryptedPassphrase: encryptedPassphrase };
};
exports.decryptPassphrase = function(_a) {
	var encryptedPassphrase = _a.encryptedPassphrase,
		password = _a.password;
	var encryptedPassphraseObject = cryptography.parseEncryptedPassphrase(
		encryptedPassphrase,
	);
	var passphrase = cryptography.decryptPassphraseWithPassword(
		encryptedPassphraseObject,
		password,
	);
	return { passphrase: passphrase };
};
exports.getKeys = cryptography.getKeys;
exports.getAddressFromPublicKey = function(publicKey) {
	return {
		address: cryptography.getAddressFromPublicKey(publicKey),
	};
};
exports.signMessage = function(_a) {
	var message = _a.message,
		passphrase = _a.passphrase;
	return cryptography.signMessageWithPassphrase(message, passphrase);
};
exports.verifyMessage = function(_a) {
	var publicKey = _a.publicKey,
		signature = _a.signature,
		message = _a.message;
	return {
		verified: cryptography.verifyMessageWithPublicKey({
			publicKey: publicKey,
			signature: signature,
			message: message,
		}),
	};
};
//# sourceMappingURL=cryptography.js.map
