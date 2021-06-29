import { Request, Response, NextFunction } from 'express';
export declare const whiteListMiddleware: ({ whiteList, }?: {
    whiteList: ReadonlyArray<string>;
}) => (req: Request, _res: Response, next: NextFunction) => void;
