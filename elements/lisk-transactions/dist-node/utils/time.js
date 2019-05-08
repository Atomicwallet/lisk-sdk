"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var MS_TIME = 1000;
exports.getTimeFromBlockchainEpoch = function (givenTimestamp) {
    var startingPoint = givenTimestamp || new Date().getTime();
    var blockchainInitialTime = constants_1.EPOCH_TIME_MILLISECONDS;
    return Math.floor((startingPoint - blockchainInitialTime) / MS_TIME);
};
exports.getTimeWithOffset = function (offset) {
    var now = new Date().getTime();
    var timeWithOffset = offset ? now + offset * MS_TIME : now;
    return exports.getTimeFromBlockchainEpoch(timeWithOffset);
};
//# sourceMappingURL=time.js.map