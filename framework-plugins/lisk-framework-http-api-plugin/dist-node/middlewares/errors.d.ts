/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
export declare class ErrorWithStatus extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
interface ErrorWithDetails extends Error {
    errors: Error[];
}
export declare const errorMiddleware: () => (err: Error | Error[] | ErrorWithDetails, _req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>, _next: NextFunction) => void;
export {};
