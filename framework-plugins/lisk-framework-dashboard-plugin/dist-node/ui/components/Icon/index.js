"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Icon_module_scss_1 = require("./Icon.module.scss");
const Icon = props => {
    var _a;
    const { name } = props;
    const size = (_a = props.size) !== null && _a !== void 0 ? _a : 'm';
    return React.createElement("span", { className: `${Icon_module_scss_1.default.icon} ${Icon_module_scss_1.default[`icon-${size}`]}` }, name);
};
exports.default = Icon;
//# sourceMappingURL=index.js.map