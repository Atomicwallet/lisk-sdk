"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
class Account {
    constructor(channel, schemas) {
        this._channel = channel;
        this._schemas = schemas;
    }
    async get(address) {
        const addressString = Buffer.isBuffer(address) ? address.toString('hex') : address;
        const accountHex = await this._channel.invoke('app:getAccount', {
            address: addressString,
        });
        return this.decode(Buffer.from(accountHex, 'hex'));
    }
    encode(input) {
        return lisk_codec_1.codec.encode(this._schemas.account, input);
    }
    decode(input) {
        const inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'hex');
        return lisk_codec_1.codec.decode(this._schemas.account, inputBuffer);
    }
    toJSON(account) {
        return lisk_codec_1.codec.toJSON(this._schemas.account, account);
    }
    fromJSON(account) {
        return lisk_codec_1.codec.fromJSON(this._schemas.account, account);
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map