"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccount = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const getAccount = (channel, codec) => async (req, res, next) => {
    const accountAddress = req.params.address;
    if (!lisk_validator_1.isHexString(accountAddress)) {
        res.status(400).send({
            errors: [{ message: 'The Address parameter should be a hex string.' }],
        });
        return;
    }
    try {
        const account = await channel.invoke('app:getAccount', {
            address: accountAddress,
        });
        res.status(200).send({ data: codec.decodeAccount(account), meta: {} });
    }
    catch (err) {
        if (err.message.startsWith('Specified key accounts:address')) {
            res.status(404).send({
                errors: [{ message: `Account with address '${accountAddress}' was not found` }],
            });
        }
        else {
            next(err);
        }
    }
};
exports.getAccount = getAccount;
//# sourceMappingURL=accounts.js.map