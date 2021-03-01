"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strip_ansi = require("strip-ansi");
const tablify_1 = require("./tablify");
const removeANSIFromObject = (object) => Object.entries(object).reduce((strippedResult, [key, value]) => ({
    ...strippedResult,
    [key]: strip_ansi(value),
}), {});
const isStringMapArray = (result) => Array.isArray(result);
const removeANSI = (result) => isStringMapArray(result) ? result.map(removeANSIFromObject) : removeANSIFromObject(result);
exports.print = ({ json, pretty } = {}) => function printResult(result) {
    const resultToPrint = json ? removeANSI(result) : result;
    const output = json
        ? JSON.stringify(resultToPrint, undefined, pretty ? '\t' : undefined)
        : tablify_1.tablify(resultToPrint).toString();
    const logger = this && this.log ? this : console;
    logger.log(output);
};
//# sourceMappingURL=print.js.map