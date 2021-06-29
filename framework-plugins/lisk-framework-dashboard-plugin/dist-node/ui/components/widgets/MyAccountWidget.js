"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const widget_1 = require("../widget");
const Table_1 = require("../Table");
const CopiableText_1 = require("../CopiableText");
const Text_1 = require("../Text");
const MyAccountWidget = props => {
    const { accounts, onSelect } = props;
    const handleClick = (account) => {
        if (onSelect) {
            onSelect(account);
        }
    };
    return (React.createElement(widget_1.Widget, null,
        React.createElement(widget_1.WidgetHeader, null,
            React.createElement(Text_1.default, { type: 'h2' }, "My Accounts")),
        React.createElement(widget_1.WidgetBody, null, (accounts === null || accounts === void 0 ? void 0 : accounts.length) ? (React.createElement(Table_1.Table, null,
            React.createElement(Table_1.TableHeader, { sticky: true },
                React.createElement("tr", null,
                    React.createElement("th", null,
                        React.createElement(Text_1.default, null, "Binary addresss")),
                    React.createElement("th", null,
                        React.createElement(Text_1.default, null, "Public Key")))),
            React.createElement(Table_1.TableBody, null, accounts.map((account) => (React.createElement("tr", { onClick: () => handleClick(account), key: account.binaryAddress },
                React.createElement("td", null,
                    React.createElement(CopiableText_1.default, { text: account.binaryAddress }, account.binaryAddress)),
                React.createElement("td", null,
                    React.createElement(CopiableText_1.default, { text: account.publicKey }, account.publicKey)))))))) : (React.createElement(Text_1.default, null, "You don't have any accounts")))));
};
exports.default = MyAccountWidget;
//# sourceMappingURL=MyAccountWidget.js.map