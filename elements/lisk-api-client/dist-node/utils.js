"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toQueryString = function (obj) {
    var parts = Object.keys(obj).reduce(function (accumulator, key) { return __spread(accumulator, [
        encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]),
    ]); }, []);
    return parts.join('&');
};
var urlParamRegex = /{[^}]+}/;
exports.solveURLParams = function (url, params) {
    if (params === void 0) { params = {}; }
    if (Object.keys(params).length === 0) {
        if (url.match(urlParamRegex) !== null) {
            throw new Error('URL is not completely solved');
        }
        return url;
    }
    var solvedURL = Object.keys(params).reduce(function (accumulator, key) {
        return accumulator.replace("{" + key + "}", params[key]);
    }, url);
    if (solvedURL.match(urlParamRegex) !== null) {
        throw new Error('URL is not completely solved');
    }
    return encodeURI(solvedURL);
};
//# sourceMappingURL=utils.js.map