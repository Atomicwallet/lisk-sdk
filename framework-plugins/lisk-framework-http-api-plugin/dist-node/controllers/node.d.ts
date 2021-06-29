import { Request, Response, NextFunction } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';
export declare const getNodeInfo: (channel: BaseChannel) => (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTransactions: (channel: BaseChannel, codec: PluginCodec) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
