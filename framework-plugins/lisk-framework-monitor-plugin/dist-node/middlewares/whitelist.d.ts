/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
export declare const whiteListMiddleware: ({ whiteList, }?: {
    whiteList: readonly string[];
}) => (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, _res: Response<any>, next: NextFunction) => void;
