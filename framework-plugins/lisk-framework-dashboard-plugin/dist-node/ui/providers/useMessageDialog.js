"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const MessageDialogProvider_1 = require("./MessageDialogProvider");
const useMessageDialog = () => {
    const { dispatch } = React.useContext(MessageDialogProvider_1.MessageDialogProviderContext);
    const showMessageDialog = (title, body, options) => {
        var _a;
        dispatch({ open: true, title, body, backBtn: (_a = options === null || options === void 0 ? void 0 : options.backButton) !== null && _a !== void 0 ? _a : false });
    };
    const closeMessageDialog = () => {
        dispatch({ open: false, title: '', body: React.createElement(React.Fragment, null), backBtn: false });
    };
    return { showMessageDialog, closeMessageDialog };
};
exports.default = useMessageDialog;
//# sourceMappingURL=useMessageDialog.js.map