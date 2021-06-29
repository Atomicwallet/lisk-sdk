"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogContext = void 0;
const React = require("react");
const Dialog_module_scss_1 = require("./Dialog.module.scss");
exports.DialogContext = React.createContext({ closeDialog: () => { } });
const Dialog = props => {
    const [open, setOpen] = React.useState(props.open);
    const triggerClose = () => {
        setOpen(false);
        if (props.onClose) {
            props.onClose();
        }
    };
    const triggerOpen = () => {
        setOpen(true);
        if (props.onOpen) {
            props.onOpen();
        }
    };
    React.useEffect(() => {
        if (props.open) {
            triggerOpen();
        }
        else {
            triggerClose();
        }
    }, [props.open]);
    return (React.createElement("div", { className: `${Dialog_module_scss_1.default.root} ${open ? Dialog_module_scss_1.default.open : Dialog_module_scss_1.default.close}` },
        React.createElement("div", { className: Dialog_module_scss_1.default.background },
            React.createElement("div", { className: Dialog_module_scss_1.default.modal },
                React.createElement(exports.DialogContext.Provider, { value: { closeDialog: triggerClose } }, props.children)))));
};
exports.default = Dialog;
//# sourceMappingURL=Dialog.js.map