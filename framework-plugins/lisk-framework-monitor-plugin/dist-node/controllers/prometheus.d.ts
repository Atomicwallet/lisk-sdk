/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
import { BaseChannel } from 'lisk-framework';
import { SharedState } from '../types';
export declare const getData: (channel: BaseChannel, state: SharedState) => (_req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>, next: NextFunction) => Promise<void>;
