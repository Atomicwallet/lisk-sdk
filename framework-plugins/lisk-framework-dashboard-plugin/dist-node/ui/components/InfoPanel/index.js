"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const widget_1 = require("../widget");
const Icon_1 = require("../Icon");
const Text_1 = require("../Text");
const InfoPanel_module_scss_1 = require("./InfoPanel.module.scss");
const InfoPanel = props => (React.createElement(widget_1.Widget, null,
    React.createElement(widget_1.WidgetBody, { size: 'xs', mode: props.mode },
        React.createElement("div", { className: InfoPanel_module_scss_1.default.infoHeading },
            React.createElement(Text_1.default, { type: "tr", color: "platinum_gray" }, props.title),
            props.onClick && (React.createElement("a", { href: "#", onClick: props.onClick },
                React.createElement(Icon_1.default, { size: 'l', name: 'chevron_right' }, "chevron_right")))),
        React.createElement("div", null, props.children))));
exports.default = InfoPanel;
//# sourceMappingURL=index.js.map