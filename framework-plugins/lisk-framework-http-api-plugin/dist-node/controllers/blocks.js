"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockByHeight = exports.getBlockById = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const getBlockById = (channel, codec) => async (req, res, next) => {
    const blockId = req.params.id;
    if (!lisk_validator_1.isHexString(blockId)) {
        res.status(400).send({
            errors: [{ message: 'The block id parameter should be a hex string.' }],
        });
        return;
    }
    try {
        const block = await channel.invoke('app:getBlockByID', { id: blockId });
        res.status(200).send({ data: codec.decodeBlock(block), meta: {} });
    }
    catch (err) {
        if (err.message.startsWith('Specified key blocks:id')) {
            res.status(404).send({
                errors: [{ message: `Block with id '${blockId}' was not found` }],
            });
        }
        else {
            next(err);
        }
    }
};
exports.getBlockById = getBlockById;
const getBlockByHeight = (channel, codec) => async (req, res, next) => {
    const { height } = req.query;
    if (!lisk_validator_1.isNumberString(height) || !lisk_validator_1.isUInt32(Number(height))) {
        res.status(400).send({
            errors: [{ message: 'The block height query parameter should be a number within uint32.' }],
        });
        return;
    }
    try {
        const block = await channel.invoke('app:getBlockByHeight', {
            height: parseInt(height, 10),
        });
        res.status(200).send({ data: [codec.decodeBlock(block)], meta: {} });
    }
    catch (err) {
        if (err.message.startsWith('Specified key blocks:height')) {
            res.status(404).send({
                errors: [{ message: `Block with height '${height}' was not found` }],
            });
        }
        else {
            next(err);
        }
    }
};
exports.getBlockByHeight = getBlockByHeight;
//# sourceMappingURL=blocks.js.map