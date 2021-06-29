"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slots = void 0;
const SEC_IN_MS = 1000;
class Slots {
    constructor({ genesisBlockTimestamp, interval }) {
        this._genesisTime = genesisBlockTimestamp;
        this._interval = interval;
    }
    timeSinceGenesis() {
        return Math.floor((Date.now() - this._genesisTime * SEC_IN_MS) / SEC_IN_MS);
    }
    blockTime() {
        return this._interval;
    }
    getSlotNumber(timeStamp) {
        const time = timeStamp !== null && timeStamp !== void 0 ? timeStamp : Math.floor(Date.now() / SEC_IN_MS);
        const elapsedTime = time - this._genesisTime;
        return Math.floor(elapsedTime / this._interval);
    }
    getSlotTime(slot) {
        const slotGenesisTimeOffset = slot * this._interval;
        return this._genesisTime + slotGenesisTimeOffset;
    }
    getNextSlot() {
        const slot = this.getSlotNumber();
        return slot + 1;
    }
    isWithinTimeslot(slot, time) {
        return this.getSlotNumber(time) === slot;
    }
}
exports.Slots = Slots;
//# sourceMappingURL=slots.js.map