"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
var url_1 = tslib_1.__importDefault(require("url"));
var base_1 = tslib_1.__importDefault(require("../../base"));
var config_1 = require("../../utils/config");
var constants_1 = require("../../utils/constants");
var error_1 = require("../../utils/error");
var availableVariables = constants_1.CONFIG_VARIABLES.join(', ');
var WRITE_FAIL_WARNING = 'Config file could not be written: your changes will not be persisted.';
var NETHASH_ERROR_MESSAGE = 'Value must be a hex string with 64 characters, or one of main or test.';
var URL_ERROR_MESSAGE = "Node URLs must include a supported protocol (" + constants_1.API_PROTOCOLS.map(function (protocol) { return protocol.replace(':', ''); }).join(', ') + ") and a hostname. E.g. https://127.0.0.1:4000 or http://localhost.";
var checkBoolean = function (value) { return ['true', 'false'].includes(value); };
var setNestedConfigProperty = function (config, path, value) {
    var dotNotationArray = path.split('.');
    dotNotationArray.reduce(function (obj, pathComponent, i) {
        if (i === dotNotationArray.length - 1) {
            if (obj === undefined) {
                throw new error_1.ValidationError("Config file could not be written: property '" + dotNotationArray.join('.') + "' was not found. It looks like your configuration file is corrupted. Please check the file at " + process.env.XDG_CONFIG_HOME + " or remove it (a fresh default configuration file will be created when you run Lisk Commander again).");
            }
            obj[pathComponent] = value;
            return config;
        }
        return obj[pathComponent];
    }, config);
};
var attemptWriteToFile = function (newConfig, value, dotNotation) {
    var writeSuccess = config_1.setConfig(process.env.XDG_CONFIG_HOME, newConfig);
    if (!writeSuccess) {
        throw new error_1.FileSystemError(WRITE_FAIL_WARNING);
    }
    var message = value === '' || (Array.isArray(value) && value.length === 0)
        ? "Successfully reset " + dotNotation + "."
        : "Successfully set " + dotNotation + " to " + value + ".";
    var result = {
        message: message,
    };
    return result;
};
var setValue = function (config, dotNotation, value) {
    setNestedConfigProperty(config, dotNotation, value);
    return attemptWriteToFile(config, value, dotNotation);
};
var setBoolean = function (config, dotNotation, value) {
    if (!checkBoolean(value)) {
        throw new error_1.ValidationError('Value must be a boolean.');
    }
    var newValue = value === 'true';
    return setValue(config, dotNotation, newValue);
};
var setArrayURL = function (config, dotNotation, _, inputs) {
    inputs.forEach(function (input) {
        var _a = url_1.default.parse(input), protocol = _a.protocol, hostname = _a.hostname;
        if (protocol === undefined ||
            !constants_1.API_PROTOCOLS.includes(protocol) ||
            !hostname) {
            throw new error_1.ValidationError(URL_ERROR_MESSAGE);
        }
    });
    return setValue(config, dotNotation, inputs);
};
var setNethash = function (config, dotNotation, value) {
    if (dotNotation === 'api.network' &&
        !Object.keys(constants_1.NETHASHES).includes(value)) {
        var NETHASH_LENGTH = 64;
        if (value.length !== NETHASH_LENGTH) {
            throw new error_1.ValidationError(NETHASH_ERROR_MESSAGE);
        }
        try {
            lisk_cryptography_1.hexToBuffer(value, 'utf8');
        }
        catch (error) {
            throw new error_1.ValidationError(NETHASH_ERROR_MESSAGE);
        }
    }
    return setValue(config, dotNotation, value);
};
var handlers = {
    'api.nodes': setArrayURL,
    'api.network': setNethash,
    json: setBoolean,
    name: setValue,
    pretty: setBoolean,
};
var SetCommand = (function (_super) {
    tslib_1.__extends(SetCommand, _super);
    function SetCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args, variable, _a, valuesStr, values, safeValues, safeValue, result;
            return tslib_1.__generator(this, function (_b) {
                args = this.parse(SetCommand).args;
                variable = args.variable, _a = args.values, valuesStr = _a === void 0 ? '' : _a;
                values = valuesStr.split(',').filter(Boolean);
                safeValues = values || [];
                safeValue = safeValues[0] || '';
                result = handlers[variable](this.userConfig, variable, safeValue, safeValues);
                this.print(result, true);
                return [2];
            });
        });
    };
    SetCommand.args = [
        {
            name: 'variable',
            required: true,
            options: constants_1.CONFIG_VARIABLES,
            description: '',
        },
        {
            name: 'values',
            required: false,
            description: '',
        },
    ];
    SetCommand.description = "\n\t\tSets configuration.\n\t\t...\n\t\tVariables available: " + availableVariables + ".\n\t";
    SetCommand.examples = [
        'config:set json true',
        'config:set api.network main',
        'config:set api.nodes https://127.0.0.1:4000,http://mynode.com:7000',
    ];
    return SetCommand;
}(base_1.default));
exports.default = SetCommand;
//# sourceMappingURL=set.js.map