"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDelegates = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const utils_1 = require("../utils");
const getDelegatesQuerySchema = {
    type: 'object',
    properties: {
        limit: {
            type: 'string',
            format: 'uint32',
            description: 'Number of delegates to be returned',
        },
        offset: {
            type: 'string',
            format: 'uint32',
            description: 'Offset to get delegates after a specific length in a delegates list',
        },
    },
};
const getDelegates = (channel, codec) => async (req, res, next) => {
    const errors = lisk_validator_1.validator.validate(getDelegatesQuerySchema, req.query);
    if (errors.length) {
        res.status(400).send({
            errors: [{ message: new lisk_validator_1.LiskValidationError([...errors]).message }],
        });
        return;
    }
    const { limit = 100, offset = 0 } = req.query;
    try {
        const registeredDelegates = await channel.invoke('dpos:getAllDelegates');
        const encodedDelegateAccounts = await channel.invoke('app:getAccounts', {
            address: registeredDelegates.map(d => d.address),
        });
        const decodedDelegateAccounts = encodedDelegateAccounts.map((d) => codec.decodeAccount(Buffer.from(d, 'hex')));
        res.status(200).json({
            meta: { count: decodedDelegateAccounts.length, limit: +limit, offset: +offset },
            data: utils_1.paginateList(decodedDelegateAccounts, +limit, +offset),
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getDelegates = getDelegates;
//# sourceMappingURL=delegates.js.map