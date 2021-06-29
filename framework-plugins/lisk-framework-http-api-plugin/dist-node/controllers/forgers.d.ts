import { Request, Response, NextFunction } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';
export declare const getForgers: (channel: BaseChannel, codec: PluginCodec) => (_req: Request, res: Response, next: NextFunction) => Promise<void>;
