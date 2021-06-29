"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Table_module_scss_1 = require("./Table.module.scss");
const Table = props => {
    const classes = [Table_module_scss_1.default.root];
    return (React.createElement("div", { className: Table_module_scss_1.default.tableContainer },
        React.createElement("table", { className: `${classes.join(' ')}` }, props.children)));
};
exports.default = Table;
//# sourceMappingURL=Table.js.map