"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Icon_1 = require("../Icon");
const IconButton_module_scss_1 = require("./IconButton.module.scss");
const IconButton = props => {
    var _a;
    const { icon, onClick } = props;
    const size = (_a = props.size) !== null && _a !== void 0 ? _a : 'm';
    return (React.createElement("div", { className: IconButton_module_scss_1.default['icon-button'], onClick: onClick },
        React.createElement(Icon_1.default, { name: icon, size: size })));
};
exports.default = IconButton;
//# sourceMappingURL=index.js.map