"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whiteListMiddleware = void 0;
const ip = require("ip");
const errors_1 = require("./errors");
const defualtOption = { whiteList: [] };
const checkIpInList = (list, addr) => {
    let entry;
    for (const value of list) {
        entry = value;
        if (ip.isV4Format(entry)) {
            entry += '/32';
        }
        try {
            entry = ip.cidrSubnet(entry);
            if (entry.contains(addr)) {
                return true;
            }
        }
        catch (err) {
            console.error('CheckIpInList:', err.toString());
        }
    }
    return false;
};
const whiteListMiddleware = ({ whiteList, } = defualtOption) => (req, _res, next) => {
    if (whiteList.length === 0 || checkIpInList(whiteList, req.ip)) {
        next();
        return;
    }
    next(new errors_1.ErrorWithStatus('Access Denied', 401));
};
exports.whiteListMiddleware = whiteListMiddleware;
//# sourceMappingURL=whitelist.js.map