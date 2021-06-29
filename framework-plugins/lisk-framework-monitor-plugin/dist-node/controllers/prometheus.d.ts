import { Request, Response, NextFunction } from 'express';
import { BaseChannel } from 'lisk-framework';
import { SharedState } from '../types';
export declare const getData: (channel: BaseChannel, state: SharedState) => (_req: Request, res: Response, next: NextFunction) => Promise<void>;
