"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeWithOffset = exports.getTimeFromBlockchainEpoch = void 0;
const constants_1 = require("../constants");
const MS_TIME = 1000;
const getTimeFromBlockchainEpoch = (givenTimestamp) => {
    const startingPoint = givenTimestamp || new Date().getTime();
    const blockchainInitialTime = constants_1.EPOCH_TIME_MILLISECONDS;
    return Math.floor((startingPoint - blockchainInitialTime) / MS_TIME);
};
exports.getTimeFromBlockchainEpoch = getTimeFromBlockchainEpoch;
const getTimeWithOffset = (offset) => {
    const now = new Date().getTime();
    const timeWithOffset = offset ? now + offset * MS_TIME : now;
    return exports.getTimeFromBlockchainEpoch(timeWithOffset);
};
exports.getTimeWithOffset = getTimeWithOffset;
//# sourceMappingURL=time.js.map