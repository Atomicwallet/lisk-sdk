import { Request, Response, NextFunction } from 'express';
import { BaseChannel } from 'lisk-framework';
export declare const getForgingStatus: (channel: BaseChannel) => (_req: Request, res: Response) => Promise<void>;
export declare const updateForging: (channel: BaseChannel) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
