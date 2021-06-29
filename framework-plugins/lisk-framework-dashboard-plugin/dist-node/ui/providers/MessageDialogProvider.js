"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDialogProviderContext = void 0;
const React = require("react");
const MessageDialog_1 = require("../components/dialogs/MessageDialog");
const defaultValue = {
    open: false,
    title: '',
    body: React.createElement(React.Fragment, null),
    backBtn: true,
};
exports.MessageDialogProviderContext = React.createContext({ state: defaultValue, dispatch: () => { } });
const MessageDialogProvider = props => {
    const [state, updateState] = React.useState(defaultValue);
    return (React.createElement(exports.MessageDialogProviderContext.Provider, { value: { state, dispatch: updateState } },
        React.createElement(MessageDialog_1.default, { open: state.open, title: state.title, backBtn: state.backBtn, onClose: () => {
                updateState({ ...state, open: false });
            } }, state.body),
        props.children));
};
exports.default = MessageDialogProvider;
//# sourceMappingURL=MessageDialogProvider.js.map