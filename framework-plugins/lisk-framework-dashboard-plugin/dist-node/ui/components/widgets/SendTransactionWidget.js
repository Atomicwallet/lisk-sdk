"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const widget_1 = require("../widget");
const Text_1 = require("../Text");
const SelectInput_1 = require("../input/SelectInput");
const input_1 = require("../input");
const Box_1 = require("../Box");
const Button_1 = require("../Button");
const SendTransactionWidget = props => {
    const [passphrase, setPassphrase] = React.useState('');
    const [asset, setAsset] = React.useState('{}');
    const [validAsset, setValidAsset] = React.useState(true);
    const assets = props.modules
        .map(m => m.transactionAssets.map(t => ({
        label: `${m.name}:${t.name}`,
        value: `${m.name}:${t.name}`,
    })))
        .flat();
    const [selectedAsset, setSelectedAsset] = React.useState(assets[0]);
    const handleSubmit = () => {
        const assetSelectedValue = selectedAsset ? selectedAsset.value : '';
        const moduleName = assetSelectedValue.split(':').shift();
        const assetName = assetSelectedValue.split(':').slice(1).join(':');
        let moduleID;
        let assetID;
        for (const m of props.modules) {
            if (m.name === moduleName) {
                moduleID = m.id;
                for (const t of m.transactionAssets) {
                    if (t.name === assetName) {
                        assetID = t.id;
                        break;
                    }
                }
                break;
            }
        }
        if (moduleID !== undefined && assetID !== undefined) {
            props.onSubmit({
                moduleID,
                assetID,
                passphrase,
                asset: JSON.parse(asset),
            });
        }
    };
    return (React.createElement(widget_1.Widget, null,
        React.createElement(widget_1.WidgetHeader, null,
            React.createElement(Text_1.default, { type: 'h2' }, 'Send transaction')),
        React.createElement(widget_1.WidgetBody, null,
            React.createElement(Box_1.default, { mb: 4 },
                React.createElement(SelectInput_1.default, { multi: false, options: assets, selected: selectedAsset, onChange: val => setSelectedAsset(val) })),
            React.createElement(Box_1.default, { mb: 4 },
                React.createElement(input_1.TextAreaInput, { placeholder: 'Passphrase', size: 's', value: passphrase, onChange: val => setPassphrase(val) })),
            React.createElement(Box_1.default, { mb: 4 },
                React.createElement(input_1.TextAreaInput, { json: true, placeholder: 'Asset', size: 'm', value: asset, onChange: val => {
                        try {
                            JSON.parse(val !== null && val !== void 0 ? val : '');
                            setValidAsset(true);
                        }
                        catch (error) {
                            setValidAsset(false);
                        }
                        setAsset(val);
                    } })),
            React.createElement(Box_1.default, { textAlign: 'center' },
                React.createElement(Button_1.default, { size: 'm', onClick: handleSubmit, disabled: !validAsset }, "Submit")))));
};
exports.default = SendTransactionWidget;
//# sourceMappingURL=SendTransactionWidget.js.map