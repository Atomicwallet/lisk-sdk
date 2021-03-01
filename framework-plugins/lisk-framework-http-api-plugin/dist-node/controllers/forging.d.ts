/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
import { BaseChannel } from 'lisk-framework';
export declare const getForgingStatus: (channel: BaseChannel) => (_req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>) => Promise<void>;
export declare const updateForging: (channel: BaseChannel) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>, next: NextFunction) => Promise<void>;
