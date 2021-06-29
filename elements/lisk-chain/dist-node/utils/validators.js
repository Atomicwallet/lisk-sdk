"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidators = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const schema_1 = require("../schema");
const constants_1 = require("../constants");
const getValidators = async (stateStore) => {
    const validatorsBuffer = await stateStore.consensus.get(constants_1.CONSENSUS_STATE_VALIDATORS_KEY);
    if (!validatorsBuffer) {
        throw new Error('Validator set must exist');
    }
    const { validators } = lisk_codec_1.codec.decode(schema_1.validatorsSchema, validatorsBuffer);
    return validators;
};
exports.getValidators = getValidators;
//# sourceMappingURL=validators.js.map