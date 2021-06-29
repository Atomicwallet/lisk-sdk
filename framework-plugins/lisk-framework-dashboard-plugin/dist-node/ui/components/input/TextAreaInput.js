"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const json_format_highlight_1 = require("json-format-highlight");
const Input_module_scss_1 = require("./Input.module.scss");
const json_color_1 = require("../../utils/json_color");
const TextAreaInput = props => {
    var _a, _b;
    const { placeholder } = props;
    const size = (_a = props.size) !== null && _a !== void 0 ? _a : 'm';
    const handleOnChange = (event) => {
        if (props.onChange) {
            props.onChange(event.target.value);
        }
    };
    const editorRef = React.useRef(null);
    if (props.json) {
        let validJSON = true;
        try {
            JSON.parse((_b = props.value) !== null && _b !== void 0 ? _b : '');
        }
        catch (error) {
            validJSON = false;
        }
        const showHighlightJSON = (data) => json_format_highlight_1.default(data, json_color_1.jsonHighlight);
        const syncScroll = (val) => {
            if (!(editorRef === null || editorRef === void 0 ? void 0 : editorRef.current)) {
                return;
            }
            const node = editorRef.current;
            node.scrollTop = val.currentTarget.scrollTop;
            node.scrollLeft = val.currentTarget.scrollLeft;
        };
        return (React.createElement("div", { className: `${Input_module_scss_1.default.editor} ${Input_module_scss_1.default[`textArea-${size}`]} ${validJSON ? '' : Input_module_scss_1.default['editor-error']}` },
            !props.readonly && (React.createElement("textarea", { className: `${Input_module_scss_1.default.textArea} ${Input_module_scss_1.default['editor-textarea']}`, spellCheck: false, defaultValue: props.value, onScroll: val => {
                    syncScroll(val);
                }, onInput: val => {
                    if (props.onChange) {
                        props.onChange(val.currentTarget.value);
                    }
                    syncScroll(val);
                } })),
            React.createElement("pre", { className: Input_module_scss_1.default['editor-code'], ref: editorRef },
                React.createElement("code", { dangerouslySetInnerHTML: { __html: showHighlightJSON(props.value) } }))));
    }
    return (React.createElement("textarea", { value: props.value, placeholder: placeholder, className: `${Input_module_scss_1.default.textArea} ${Input_module_scss_1.default[`textArea-${size}`]}`, onChange: handleOnChange }));
};
exports.default = TextAreaInput;
//# sourceMappingURL=TextAreaInput.js.map