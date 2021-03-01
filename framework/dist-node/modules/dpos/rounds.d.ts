export declare class Rounds {
    readonly blocksPerRound: number;
    constructor({ blocksPerRound }: {
        blocksPerRound: number;
    });
    calcRound(height: number): number;
    calcRoundStartHeight(round: number): number;
    calcRoundEndHeight(round: number): number;
    calcRoundMiddleHeight(round: number): number;
}
