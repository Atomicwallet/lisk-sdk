"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Input_module_scss_1 = require("./Input.module.scss");
const TextInput = props => {
    var _a;
    const { placeholder } = props;
    const [value, updateValue] = React.useState((_a = props.value) !== null && _a !== void 0 ? _a : '');
    const handleOnChange = (event) => {
        updateValue(event.target.value);
        if (props.onChange) {
            props.onChange(event.target.value);
        }
    };
    return (React.createElement("input", { value: value, placeholder: placeholder, className: Input_module_scss_1.default.text, onChange: handleOnChange }));
};
exports.default = TextInput;
//# sourceMappingURL=TextInput.js.map