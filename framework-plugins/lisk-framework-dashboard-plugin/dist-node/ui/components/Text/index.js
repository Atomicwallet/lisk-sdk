"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Text_module_scss_1 = require("./Text.module.scss");
const Text = props => {
    var _a, _b, _c;
    const color = (_a = props.color) !== null && _a !== void 0 ? _a : 'white';
    const type = (_b = props.type) !== null && _b !== void 0 ? _b : 'p';
    const styleProps = ['root'];
    styleProps.push(type);
    styleProps.push(`color_${color}`);
    if (props.style) {
        styleProps.push(props.style);
    }
    const Tag = ['h1', 'h2', 'h3', 'p'].includes(type) ? type : 'p';
    return (React.createElement(Tag, { className: `${styleProps.map(prop => Text_module_scss_1.default[prop]).join(' ')} ${(_c = props.className) !== null && _c !== void 0 ? _c : ''}` }, props.children));
};
exports.default = Text;
//# sourceMappingURL=index.js.map