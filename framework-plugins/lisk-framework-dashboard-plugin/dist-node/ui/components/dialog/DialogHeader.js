"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const IconButton_1 = require("../IconButton");
const Dialog_module_scss_1 = require("./Dialog.module.scss");
const Dialog_1 = require("./Dialog");
const DialogHeader = props => {
    const dialogContext = React.useContext(Dialog_1.DialogContext);
    return (React.createElement("div", { className: Dialog_module_scss_1.default.header },
        React.createElement("div", { className: Dialog_module_scss_1.default.headerContent }, props.children),
        React.createElement(IconButton_1.default, { icon: 'close', size: 'l', onClick: dialogContext.closeDialog })));
};
exports.default = DialogHeader;
//# sourceMappingURL=DialogHeader.js.map