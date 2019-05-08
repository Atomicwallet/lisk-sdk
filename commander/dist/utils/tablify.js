"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cli_table3_1 = tslib_1.__importDefault(require("cli-table3"));
var chars = {
    top: '═',
    'top-mid': '╤',
    'top-left': '╔',
    'top-right': '╗',
    bottom: '═',
    'bottom-mid': '╧',
    'bottom-left': '╚',
    'bottom-right': '╝',
    left: '║',
    'left-mid': '╟',
    mid: '─',
    'mid-mid': '┼',
    right: '║',
    'right-mid': '╢',
    middle: '│',
};
var getKeyValueObject = function (object) {
    if (!object || typeof object !== 'object') {
        return object;
    }
    return Object.entries(object)
        .map(function (_a) {
        var _b = tslib_1.__read(_a, 2), key = _b[0], value = _b[1];
        return key + ": " + JSON.stringify(value, undefined, ' ');
    })
        .join('\n');
};
var getKeyValueArray = function (array) {
    return array.some(function (item) { return typeof item === 'object'; })
        ? array.map(getKeyValueObject).join('\n\n')
        : array.join('\n');
};
var addValuesToTable = function (table, data) {
    Object.entries(data).forEach(function (_a) {
        var _b = tslib_1.__read(_a, 2), key = _b[0], values = _b[1];
        var _c;
        var strValue = Array.isArray(values)
            ? getKeyValueArray(values)
            : getKeyValueObject(values);
        table.push((_c = {}, _c[key] = strValue, _c));
    });
};
exports.tablify = function (data) {
    var table = new cli_table3_1.default({
        chars: chars,
        style: {
            head: [],
            border: [],
        },
    });
    if (Array.isArray(data)) {
        data.forEach(function (value, key) {
            var cell = [
                {
                    colSpan: 2,
                    content: "data " + (key + 1),
                },
            ];
            table.push(cell);
            addValuesToTable(table, value);
        });
    }
    else {
        addValuesToTable(table, data);
    }
    return table;
};
//# sourceMappingURL=tablify.js.map