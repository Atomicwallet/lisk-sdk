"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const CopiableText_module_scss_1 = require("./CopiableText.module.scss");
const Icon_1 = require("../Icon");
const Text_1 = require("../Text");
const COPIED_TEXT = 'Copied';
const CopiableText = props => {
    const [hover, setHover] = React.useState(true);
    const [text, setText] = React.useState(props.text);
    let copiedTimeout;
    const clipToClipboard = async (event, textToCopy) => {
        event.stopPropagation();
        setHover(true);
        setText(COPIED_TEXT);
        copiedTimeout = setTimeout(() => {
            setText(textToCopy);
        }, 2000);
        await navigator.clipboard.writeText(textToCopy);
    };
    React.useEffect(() => clearTimeout(copiedTimeout));
    return (React.createElement("div", { className: CopiableText_module_scss_1.default.root, onMouseOver: () => (text === COPIED_TEXT ? setHover(true) : setHover(false)), onMouseOut: () => setHover(true) },
        React.createElement(Text_1.default, { color: props.color, type: props.type, className: CopiableText_module_scss_1.default.copyText }, text.substr(0, text.length - 4)),
        React.createElement(Text_1.default, { color: props.color, type: props.type, className: CopiableText_module_scss_1.default.copyTextIndent }, text.substr(text.length - 4)),
        React.createElement("div", { className: `${CopiableText_module_scss_1.default.icon}`, onClick: async (event) => clipToClipboard(event, text) },
            React.createElement("span", { hidden: hover },
                React.createElement(Icon_1.default, { name: 'content_copy', size: props.size })))));
};
exports.default = CopiableText;
//# sourceMappingURL=index.js.map