"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateForging = exports.getForgingStatus = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const updateForgingParams = {
    type: 'object',
    required: ['address', 'password', 'forging'],
    properties: {
        address: {
            type: 'string',
            description: 'Address should be a hex string',
        },
        password: {
            type: 'string',
            description: 'Password should be a string',
        },
        forging: {
            type: 'boolean',
            description: 'Boolean flag to enable or disable forging',
        },
        height: {
            type: 'number',
            description: 'Delegates previously forged height',
        },
        maxHeightPreviouslyForged: {
            type: 'number',
            description: 'Delegates previously forged height',
        },
        maxHeightPrevoted: {
            type: 'number',
            description: 'Delegates largest prevoted height for a block',
        },
        overwrite: {
            type: 'boolean',
            description: 'Boolean flag to overwrite forger info',
        },
    },
};
const isLessThanZero = (value) => value === null || value === undefined || value < 0;
const getForgingStatus = (channel) => async (_req, res) => {
    const forgingDelegates = await channel.invoke('app:getForgingStatus');
    res.status(200).json({
        meta: { count: forgingDelegates.length },
        data: forgingDelegates,
    });
};
exports.getForgingStatus = getForgingStatus;
const updateForging = (channel) => async (req, res, next) => {
    const errors = lisk_validator_1.validator.validate(updateForgingParams, req.body);
    if (errors.length) {
        res.status(400).send({
            errors: [{ message: new lisk_validator_1.LiskValidationError([...errors]).message }],
        });
        return;
    }
    const { address, password, forging, height, maxHeightPreviouslyForged, maxHeightPrevoted, overwrite, } = req.body;
    if (!lisk_validator_1.isHexString(address)) {
        res.status(400).send({
            errors: [{ message: 'The address parameter should be a hex string.' }],
        });
        return;
    }
    if (isLessThanZero(maxHeightPreviouslyForged) ||
        isLessThanZero(maxHeightPrevoted) ||
        isLessThanZero(height)) {
        res.status(400).send({
            errors: [
                {
                    message: 'The maxHeightPreviouslyForged, maxHeightPrevoted, height parameter must be specified and greater than or equal to 0.',
                },
            ],
        });
        return;
    }
    try {
        const result = await channel.invoke('app:updateForgingStatus', {
            address,
            password,
            forging,
            height,
            maxHeightPreviouslyForged,
            maxHeightPrevoted,
            overwrite,
        });
        res.status(200).json({
            meta: { count: 1 },
            data: {
                address: result.address,
                forging: result.forging,
                height,
                maxHeightPreviouslyForged,
                maxHeightPrevoted,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateForging = updateForging;
//# sourceMappingURL=forging.js.map