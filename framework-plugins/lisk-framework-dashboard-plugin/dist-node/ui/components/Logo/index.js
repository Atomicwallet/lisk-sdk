"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Logo_module_scss_1 = require("./Logo.module.scss");
const logo_svg_1 = require("../../logo.svg");
const Logo = (props) => {
    var _a;
    const name = (_a = props.name) !== null && _a !== void 0 ? _a : 'Lisk';
    return (React.createElement("div", { className: Logo_module_scss_1.default.wrapper },
        React.createElement("img", { src: logo_svg_1.default, alt: "Lisk SDK Logo", className: Logo_module_scss_1.default.img }),
        React.createElement("div", { className: Logo_module_scss_1.default.branding },
            name && React.createElement("span", { className: Logo_module_scss_1.default.brandingText }, name),
            React.createElement("span", { className: Logo_module_scss_1.default.brandingText }, "Dashboard"))));
};
exports.default = Logo;
//# sourceMappingURL=index.js.map