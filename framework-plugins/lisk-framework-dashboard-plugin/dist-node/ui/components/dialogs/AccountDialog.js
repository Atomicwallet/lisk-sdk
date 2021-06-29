"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const dialog_1 = require("../dialog");
const Text_1 = require("../Text");
const Grid_1 = require("../Grid");
const CopiableText_1 = require("../CopiableText");
const Box_1 = require("../Box");
const AccountDialog = props => {
    var _a;
    const { account, ...rest } = props;
    return (React.createElement(dialog_1.Dialog, Object.assign({}, rest),
        React.createElement(dialog_1.DialogHeader, null,
            React.createElement(Text_1.default, { type: 'h1' }, "Account details")),
        React.createElement(dialog_1.DialogBody, null, account && (React.createElement(Grid_1.default, { container: true, fluid: true, spacing: 3 },
            React.createElement(Grid_1.default, { row: true, rowBorder: true },
                React.createElement(Grid_1.default, { xs: 12 },
                    React.createElement(Box_1.default, { mb: 2 },
                        React.createElement(Text_1.default, { type: 'h3' }, "Binary address")),
                    React.createElement(CopiableText_1.default, { text: account.binaryAddress }, account.binaryAddress))),
            React.createElement(Grid_1.default, { row: true, rowBorder: true },
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(Box_1.default, { mb: 2, mr: 1 },
                        React.createElement(Text_1.default, { type: 'h3' }, "Base32 address")),
                    React.createElement(CopiableText_1.default, { text: account.base32Address }, account.base32Address)),
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(Box_1.default, { mb: 2 },
                        React.createElement(Text_1.default, { type: 'h3' }, "Public Key")),
                    React.createElement(CopiableText_1.default, { text: account.publicKey }, account.publicKey))),
            React.createElement(Grid_1.default, { row: true },
                React.createElement(Grid_1.default, { xs: 12 },
                    React.createElement(Box_1.default, { mb: 2 },
                        React.createElement(Text_1.default, { type: 'h3' }, "Passphrase")),
                    React.createElement(CopiableText_1.default, { text: (_a = account.passphrase) !== null && _a !== void 0 ? _a : '' }, account.passphrase))))))));
};
exports.default = AccountDialog;
//# sourceMappingURL=AccountDialog.js.map