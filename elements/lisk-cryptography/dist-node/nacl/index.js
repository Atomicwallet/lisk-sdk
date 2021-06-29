"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicKey = exports.getKeyPair = exports.getRandomBytes = exports.verifyDetached = exports.signDetached = exports.openBox = exports.box = exports.NACL_SIGN_SIGNATURE_LENGTH = exports.NACL_SIGN_PUBLICKEY_LENGTH = void 0;
let lib = require('./slow');
try {
    if (process.env.NACL_FAST !== 'disable') {
        lib = require('./fast');
    }
}
catch (err) { }
exports.NACL_SIGN_PUBLICKEY_LENGTH = 32;
exports.NACL_SIGN_SIGNATURE_LENGTH = 64;
exports.box = lib.box, exports.openBox = lib.openBox, exports.signDetached = lib.signDetached, exports.verifyDetached = lib.verifyDetached, exports.getRandomBytes = lib.getRandomBytes, exports.getKeyPair = lib.getKeyPair, exports.getPublicKey = lib.getPublicKey;
//# sourceMappingURL=index.js.map