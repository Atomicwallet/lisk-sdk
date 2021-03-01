interface SlotsInput {
    readonly genesisBlockTimestamp: number;
    readonly interval: number;
}
export declare class Slots {
    private readonly _genesisTime;
    private readonly _interval;
    constructor({ genesisBlockTimestamp, interval }: SlotsInput);
    timeSinceGenesis(): number;
    blockTime(): number;
    getSlotNumber(timeStamp?: number): number;
    getSlotTime(slot: number): number;
    getNextSlot(): number;
    isWithinTimeslot(slot: number, time?: number): boolean;
}
export {};
