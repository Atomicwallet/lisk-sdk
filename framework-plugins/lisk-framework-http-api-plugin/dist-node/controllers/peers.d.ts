import { Request, Response, NextFunction } from 'express';
import { BaseChannel } from 'lisk-framework';
export interface PeerInfo {
    readonly ipAddress: string;
    readonly port: number;
    readonly networkIdentifier: string;
    readonly networkVersion: string;
    readonly nonce: string;
    readonly options: {
        [key: string]: unknown;
    };
}
export declare const getPeers: (channel: BaseChannel) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
