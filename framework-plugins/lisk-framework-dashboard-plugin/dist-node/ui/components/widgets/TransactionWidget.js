"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Table_1 = require("../Table");
const widget_1 = require("../widget");
const Text_1 = require("../Text");
const CopiableText_1 = require("../CopiableText");
const TransactionWidget_module_scss_1 = require("./TransactionWidget.module.scss");
const getModuleAsset = (nodeInfo, moduleID, assetID) => {
    var _a;
    if (!nodeInfo) {
        return 'unknown';
    }
    const registeredModule = nodeInfo.registeredModules.find(rm => rm.id === moduleID);
    if (!registeredModule) {
        return 'unknown';
    }
    const registeredAsset = (_a = registeredModule.transactionAssets) === null || _a === void 0 ? void 0 : _a.find(ta => ta.id === assetID);
    if (!registeredAsset) {
        return `${registeredModule.name}:unknown`;
    }
    return `${registeredModule.name}:${registeredAsset.name}`;
};
const TransactionWidget = props => {
    const { transactions, title } = props;
    return (React.createElement(widget_1.Widget, null,
        React.createElement(widget_1.WidgetHeader, null,
            React.createElement(Text_1.default, { type: 'h2' }, title)),
        React.createElement(widget_1.WidgetBody, null,
            React.createElement(Table_1.Table, null,
                React.createElement(Table_1.TableHeader, { sticky: true },
                    React.createElement("tr", null,
                        React.createElement("th", { className: TransactionWidget_module_scss_1.default.headerID },
                            React.createElement(Text_1.default, null, "Id")),
                        React.createElement("th", { className: TransactionWidget_module_scss_1.default.headerSender },
                            React.createElement(Text_1.default, null, "Sender")),
                        React.createElement("th", { className: TransactionWidget_module_scss_1.default.headerModule },
                            React.createElement(Text_1.default, null, "Module:Asset")),
                        React.createElement("th", { className: TransactionWidget_module_scss_1.default.headerFee },
                            React.createElement(Text_1.default, null, "Fee")))),
                React.createElement(Table_1.TableBody, null, transactions.map(transaction => (React.createElement("tr", { key: transaction.id },
                    React.createElement("td", null,
                        React.createElement(CopiableText_1.default, { text: transaction.id }, transaction.id)),
                    React.createElement("td", null,
                        React.createElement(CopiableText_1.default, { text: transaction.senderPublicKey }, transaction.senderPublicKey)),
                    React.createElement("td", null,
                        React.createElement(Text_1.default, null, getModuleAsset(props.nodeInfo, transaction.moduleID, transaction.assetID))),
                    React.createElement("td", null,
                        React.createElement(Text_1.default, null, transaction.fee))))))))));
};
exports.default = TransactionWidget;
//# sourceMappingURL=TransactionWidget.js.map