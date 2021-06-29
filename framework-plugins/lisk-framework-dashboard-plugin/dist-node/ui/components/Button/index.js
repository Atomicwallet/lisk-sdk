"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Button_module_scss_1 = require("./Button.module.scss");
const Button = props => {
    var _a;
    const { onClick } = props;
    const size = (_a = props.size) !== null && _a !== void 0 ? _a : 'm';
    return (React.createElement("button", { className: `${Button_module_scss_1.default.button} ${Button_module_scss_1.default[`button-${size}`]}`, onClick: onClick, disabled: props.disabled }, props.children));
};
exports.default = Button;
//# sourceMappingURL=index.js.map