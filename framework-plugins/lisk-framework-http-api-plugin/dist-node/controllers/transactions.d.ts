/// <reference types="qs" />
import { Request, Response } from 'express';
import { BaseChannel, PluginCodec } from 'lisk-framework';
export declare const getTransaction: (channel: BaseChannel, codec: PluginCodec) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>) => Promise<void>;
export declare const postTransaction: (channel: BaseChannel, codec: PluginCodec) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>) => Promise<void>;
