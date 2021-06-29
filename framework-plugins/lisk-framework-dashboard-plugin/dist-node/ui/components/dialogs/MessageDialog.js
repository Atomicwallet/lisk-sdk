"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const dialog_1 = require("../dialog");
const Button_1 = require("../Button");
const Text_1 = require("../Text");
const MessageDialogBody = props => {
    const dialogContext = React.useContext(dialog_1.DialogContext);
    return (React.createElement(dialog_1.DialogBody, null,
        props.children,
        props.backBtn && (React.createElement(React.Fragment, null,
            React.createElement("br", null),
            React.createElement(Button_1.default, { onClick: dialogContext.closeDialog }, "Back to Dashboard")))));
};
const MessageDialog = props => {
    const { title, backBtn, ...rest } = props;
    return (React.createElement(dialog_1.Dialog, Object.assign({}, rest),
        React.createElement(dialog_1.DialogHeader, null,
            React.createElement(Text_1.default, { type: 'h1' }, title)),
        React.createElement(MessageDialogBody, { backBtn: backBtn }, props.children)));
};
exports.default = MessageDialog;
//# sourceMappingURL=MessageDialog.js.map