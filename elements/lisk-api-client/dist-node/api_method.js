"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiMethod = void 0;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const apiMethod = (options = {}) => async function apiHandler(...args) {
    const { method = constants_1.GET, path = '', urlParams = [], validator, defaultData = {}, retry = false, } = options;
    if (urlParams.length > 0 && args.length < urlParams.length) {
        return Promise.reject(new Error(`This endpoint must be supplied with the following parameters: ${urlParams.toString()}`));
    }
    const data = Object.assign(Object.assign({}, defaultData), (args.length > urlParams.length &&
        typeof args[urlParams.length] === 'object'
        ? args[urlParams.length]
        : {}));
    if (validator) {
        try {
            validator(data);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    const resolvedURLObject = urlParams.reduce((accumulator, param, i) => {
        const value = args[i];
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new Error('Parameter must be a string or a number');
        }
        return Object.assign(Object.assign({}, accumulator), { [param]: typeof value === 'number' ? value.toString() : value });
    }, {});
    const requestData = {
        headers: this.headers,
        method,
        url: utils_1.solveURLParams(`${this.resourcePath}${path}`, resolvedURLObject),
    };
    if (Object.keys(data).length > 0) {
        if (method === constants_1.GET) {
            requestData.url += `?${utils_1.toQueryString(data)}`;
        }
        else {
            requestData.data = data;
        }
    }
    return this.request(requestData, retry);
};
exports.apiMethod = apiMethod;
//# sourceMappingURL=api_method.js.map