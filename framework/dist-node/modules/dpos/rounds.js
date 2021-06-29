"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rounds = void 0;
class Rounds {
    constructor({ blocksPerRound }) {
        this.blocksPerRound = blocksPerRound;
    }
    calcRound(height) {
        return Math.ceil(height / this.blocksPerRound);
    }
    calcRoundStartHeight(round) {
        return (round < 1 ? 0 : round - 1) * this.blocksPerRound + 1;
    }
    calcRoundEndHeight(round) {
        return (round < 1 ? 0 : round) * this.blocksPerRound;
    }
    calcRoundMiddleHeight(round) {
        return Math.floor((this.calcRoundStartHeight(round) + this.calcRoundEndHeight(round)) / 2);
    }
}
exports.Rounds = Rounds;
//# sourceMappingURL=rounds.js.map