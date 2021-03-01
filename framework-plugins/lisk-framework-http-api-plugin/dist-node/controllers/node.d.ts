/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';
export declare const getNodeInfo: (channel: BaseChannel) => (_req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>, next: NextFunction) => Promise<void>;
export declare const getTransactions: (channel: BaseChannel, codec: PluginCodec) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>, next: NextFunction) => Promise<void>;
