"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_select_1 = require("react-select");
const Input_module_scss_1 = require("./Input.module.scss");
const customSelectStyles = {
    container: (currentStyles, _state) => ({
        ...currentStyles,
        height: '40px',
        boxSizing: 'border-box',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '16px',
    }),
    valueContainer: (currentStyles, _state) => ({
        ...currentStyles,
        height: '40px',
    }),
    option: (currentStyles, state) => ({
        ...currentStyles,
        background: state.isSelected || state.isFocused ? '#4070f4' : 'inherit',
    }),
    menu: (currentStyles, _state) => ({
        ...currentStyles,
        color: '#ffffff',
        zIndex: 5,
    }),
    menuList: (currentStyles, _state) => ({
        ...currentStyles,
        boxSizing: 'border-box',
        borderRadius: '3px',
        background: 'linear-gradient(180deg, #101c3d 0%, #0c152e 100%)',
        border: '1px solid rgba(223, 230, 242, 0.2)',
        ':hover': {
            border: '1px solid #4070f4',
        },
    }),
    control: (currentStyles, _state) => ({
        ...currentStyles,
        background: 'inherit',
        border: '1px solid rgba(223, 230, 242, 0.2)',
        boxSizing: 'border-box',
        borderRadius: '3px',
        ':hover': {
            border: '1px solid #4070f4',
        },
        ':focus': {
            border: '1px solid #4070f4',
        },
    }),
    indicatorsContainer: (currentStyles, _state) => ({
        ...currentStyles,
        border: 'none',
    }),
    indicatorSeparator: (currentStyles, _state) => ({
        ...currentStyles,
        display: 'none',
    }),
    dropdownIndicator: (currentStyles, _state) => ({
        ...currentStyles,
        color: '#ffffff',
        cursor: 'pointer',
        ':hover': {
            color: '#254898',
        },
    }),
    input: (currentStyles, _state) => ({
        ...currentStyles,
        color: '#ffffff',
    }),
    singleValue: (currentStyles, _state) => ({
        ...currentStyles,
        color: '#ffffff',
    }),
    multiValue: (currentStyles, _state) => ({
        ...currentStyles,
        padding: '10px 15px 10px 15px',
        background: '#254898',
        borderRadius: '18px',
        height: '28px',
        alignItems: 'center',
        fontSize: '16px',
    }),
    multiValueLabel: (currentStyles, _state) => ({
        ...currentStyles,
        color: '#ffffff',
        background: '#254898',
    }),
    clearIndicator: (currentStyles, _state) => ({
        ...currentStyles,
        cursor: 'pointer',
        ':hover': {
            color: '#254898',
        },
    }),
    multiValueRemove: (currentStyles, _state) => ({
        ...currentStyles,
        color: '#ffffff',
        cursor: 'pointer',
        ':hover': {
            color: '#101c3d',
        },
    }),
};
const SelectInput = props => {
    var _a;
    const { options, multi } = props;
    const [value, setValue] = React.useState((_a = props.selected) !== null && _a !== void 0 ? _a : []);
    const onChangeHandler = (newValue, _actionMeta) => {
        let updatedValue;
        if (newValue && multi) {
            updatedValue = newValue;
        }
        else if (newValue && !multi) {
            updatedValue = newValue;
        }
        setValue(updatedValue);
        if (props.onChange) {
            props.onChange(updatedValue);
        }
    };
    return (React.createElement("span", { className: Input_module_scss_1.default.select },
        React.createElement(react_select_1.default, { closeMenuOnSelect: !multi, isMulti: multi, options: options, value: value, onChange: onChangeHandler, styles: customSelectStyles })));
};
exports.default = SelectInput;
//# sourceMappingURL=SelectInput.js.map