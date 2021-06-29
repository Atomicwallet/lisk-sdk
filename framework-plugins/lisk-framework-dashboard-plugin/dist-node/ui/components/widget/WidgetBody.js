"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Widget_module_scss_1 = require("./Widget.module.scss");
const WidgetBody = props => {
    var _a, _b, _c;
    const size = (_a = props.size) !== null && _a !== void 0 ? _a : 'm';
    const mode = (_b = props.mode) !== null && _b !== void 0 ? _b : 'dark';
    const scrollbar = (_c = props.scrollbar) !== null && _c !== void 0 ? _c : false;
    const classes = [Widget_module_scss_1.default.body, Widget_module_scss_1.default[`widget-body-${size}`], Widget_module_scss_1.default[`body-${mode}`]];
    if (scrollbar) {
        classes.push(Widget_module_scss_1.default['widget-body-scrollbar']);
    }
    return React.createElement("div", { className: `${classes.join(' ')}` }, props.children);
};
exports.default = WidgetBody;
//# sourceMappingURL=WidgetBody.js.map