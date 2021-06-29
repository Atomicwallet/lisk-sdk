import { Request, Response, NextFunction } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';
export declare const getBlockById: (channel: BaseChannel, codec: PluginCodec) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getBlockByHeight: (channel: BaseChannel, codec: PluginCodec) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
