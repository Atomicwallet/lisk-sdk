import { Request, Response, NextFunction } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';
export declare const getDelegates: (channel: BaseChannel, codec: PluginCodec) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
