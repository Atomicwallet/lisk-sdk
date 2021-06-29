import { Request, Response } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';
export declare const getTransaction: (channel: BaseChannel, codec: PluginCodec) => (req: Request, res: Response) => Promise<void>;
export declare const postTransaction: (channel: BaseChannel, codec: PluginCodec) => (req: Request, res: Response) => Promise<void>;
