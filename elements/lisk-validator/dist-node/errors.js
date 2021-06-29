"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiskValidationError = exports.convertErrorsToLegacyFormat = void 0;
const errorParamToString = (param) => {
    let paramAsString = '';
    if (typeof param === 'bigint') {
        paramAsString = param.toString();
    }
    else if (Buffer.isBuffer(param)) {
        paramAsString = param.toString('hex');
    }
    else if (param === undefined) {
        paramAsString = '';
    }
    else {
        paramAsString = param;
    }
    return paramAsString;
};
const convertErrorsToLegacyFormat = (errors) => errors.map(e => {
    var _a, _b;
    const err = e;
    err.dataPath = (_a = err.dataPath) !== null && _a !== void 0 ? _a : instancePathToLegacyDataPath((_b = err.instancePath) !== null && _b !== void 0 ? _b : '');
    delete err.instancePath;
    return err;
});
exports.convertErrorsToLegacyFormat = convertErrorsToLegacyFormat;
const instancePathToLegacyDataPath = (path) => path.split('/').join('.');
const errorFormatterMap = {
    type: error => {
        var _a;
        return `Property '${(_a = error.dataPath) !== null && _a !== void 0 ? _a : ''}' should be of type '${errorParamToString(error.params.type)}'`;
    },
    additionalProperties: error => {
        var _a;
        return `Property '${(_a = error.dataPath) !== null && _a !== void 0 ? _a : ''}' has extraneous property '${errorParamToString(error.params.additionalProperty)}'`;
    },
    minLength: error => { var _a; return `Property '${(_a = error.dataPath) !== null && _a !== void 0 ? _a : ''}' ${errorParamToString(error.message)}`; },
    maxLength: error => { var _a; return `Property '${(_a = error.dataPath) !== null && _a !== void 0 ? _a : ''}' ${errorParamToString(error.message)}`; },
    format: error => { var _a; return `Property '${(_a = error.dataPath) !== null && _a !== void 0 ? _a : ''}' ${errorParamToString(error.message)}`; },
    required: error => `Missing property, ${errorParamToString(error.message)}`,
    dataType: error => { var _a; return `Property '${(_a = error.dataPath) !== null && _a !== void 0 ? _a : ''}' ${errorParamToString(error.message)}`; },
};
const defaultErrorFormatter = error => { var _a; return (_a = error.message) !== null && _a !== void 0 ? _a : 'Unspecified validator error'; };
const errorFormatter = (error) => { var _a; return ((_a = errorFormatterMap[error.keyword]) !== null && _a !== void 0 ? _a : defaultErrorFormatter)(error); };
class LiskValidationError extends Error {
    constructor(errors) {
        super();
        this.errors = exports.convertErrorsToLegacyFormat(errors);
        this.message = `Lisk validator found ${this.errors.length} error[s]:\n${this._compileErrors().join('\n')}`;
    }
    _compileErrors() {
        const errorMsgs = this.errors.map(errorFormatter);
        return errorMsgs;
    }
}
exports.LiskValidationError = LiskValidationError;
//# sourceMappingURL=errors.js.map