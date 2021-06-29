"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Table_module_scss_1 = require("./Table.module.scss");
const TableHeader = props => {
    const { sticky } = props;
    const classes = [Table_module_scss_1.default.tableHeader];
    if (sticky) {
        classes.push(Table_module_scss_1.default.tableHeaderSticky);
    }
    return React.createElement("thead", { className: classes.join(' ') }, props.children);
};
exports.default = TableHeader;
//# sourceMappingURL=TableHeader.js.map