"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tablify = void 0;
const CliTable3 = require("cli-table3");
const chars = {
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
const getKeyValueObject = (object) => {
    if (!object || typeof object !== 'object') {
        return object;
    }
    return Object.entries(object)
        .map(([key, value]) => `${key}: ${JSON.stringify(value, undefined, ' ')}`)
        .join('\n');
};
const getKeyValueArray = (array) => array.some(item => typeof item === 'object')
    ? array.map(getKeyValueObject).join('\n\n')
    : array.join('\n');
const addValuesToTable = (table, data) => {
    Object.entries(data).forEach(([key, values]) => {
        const strValue = Array.isArray(values) ? getKeyValueArray(values) : getKeyValueObject(values);
        table.push({ [key]: strValue });
    });
};
const tablify = (data) => {
    const table = new CliTable3({
        chars,
        style: {
            head: [],
            border: [],
        },
    });
    if (Array.isArray(data)) {
        data.forEach((value, key) => {
            const cell = [
                {
                    colSpan: 2,
                    content: `data ${key + 1}`,
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
exports.tablify = tablify;
//# sourceMappingURL=tablify.js.map