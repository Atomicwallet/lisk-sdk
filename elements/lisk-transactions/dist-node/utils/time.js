"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const MS_TIME = 1000;
exports.getTimeFromBlockchainEpoch = (givenTimestamp) => {
    const startingPoint = givenTimestamp || new Date().getTime();
    const blockchainInitialTime = constants_1.EPOCH_TIME_MILLISECONDS;
    return Math.floor((startingPoint - blockchainInitialTime) / MS_TIME);
};
exports.getTimeWithOffset = (offset) => {
    const now = new Date().getTime();
    const timeWithOffset = offset ? now + offset * MS_TIME : now;
    return exports.getTimeFromBlockchainEpoch(timeWithOffset);
};
//# sourceMappingURL=time.js.map