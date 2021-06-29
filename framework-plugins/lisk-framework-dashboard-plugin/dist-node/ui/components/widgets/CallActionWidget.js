"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const widget_1 = require("../widget");
const Text_1 = require("../Text");
const SelectInput_1 = require("../input/SelectInput");
const input_1 = require("../input");
const Box_1 = require("../Box");
const Button_1 = require("../Button");
const CallActionWidget = props => {
    const actions = props.actions.map(action => ({ label: action, value: action })).flat();
    const [selectedAction, setSelectedAction] = React.useState();
    const [keyValue, setKeyValue] = React.useState('{}');
    const [validValue, setValidValue] = React.useState(true);
    const handleSubmit = () => {
        if (!selectedAction) {
            return;
        }
        const actionName = selectedAction.value;
        props.onSubmit({
            name: actionName,
            params: JSON.parse(keyValue),
        });
    };
    return (React.createElement(widget_1.Widget, null,
        React.createElement(widget_1.WidgetHeader, null,
            React.createElement(Text_1.default, { type: 'h2' }, 'Call action')),
        React.createElement(widget_1.WidgetBody, null,
            React.createElement(Box_1.default, { mb: 4 },
                React.createElement(SelectInput_1.default, { multi: false, options: actions, selected: selectedAction, onChange: val => setSelectedAction(val) })),
            React.createElement(Box_1.default, { mb: 4 },
                React.createElement(input_1.TextAreaInput, { json: true, placeholder: 'Params', size: 'l', value: keyValue, onChange: val => {
                        try {
                            JSON.parse(val !== null && val !== void 0 ? val : '');
                            setValidValue(true);
                        }
                        catch (error) {
                            setValidValue(false);
                        }
                        setKeyValue(val);
                    } })),
            React.createElement(Box_1.default, { textAlign: 'center' },
                React.createElement(Button_1.default, { size: 'm', onClick: handleSubmit, disabled: !validValue }, "Submit")))));
};
exports.default = CallActionWidget;
//# sourceMappingURL=CallActionWidget.js.map