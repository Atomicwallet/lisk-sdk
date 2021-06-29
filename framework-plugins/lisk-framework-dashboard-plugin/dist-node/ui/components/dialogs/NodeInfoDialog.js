"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const dialog_1 = require("../dialog");
const Text_1 = require("../Text");
const Grid_1 = require("../Grid");
const Box_1 = require("../Box");
const NodeInfoItem = props => (React.createElement(Grid_1.default, { md: 6, xs: 12 },
    React.createElement(Box_1.default, { mb: 2 },
        React.createElement(Text_1.default, { type: 'h3' }, props.label)),
    React.createElement(Text_1.default, null, props.value)));
const NodeInfoDialog = props => {
    const { nodeInfo, ...rest } = props;
    return (React.createElement(dialog_1.Dialog, Object.assign({}, rest),
        React.createElement(dialog_1.DialogHeader, null,
            React.createElement(Text_1.default, { type: 'h1' }, "Node Info")),
        React.createElement(dialog_1.DialogBody, null,
            React.createElement(Grid_1.default, { container: true, fluid: true, spacing: 3 },
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(NodeInfoItem, { label: 'Version', value: nodeInfo.version }),
                    React.createElement(NodeInfoItem, { label: 'Network version', value: nodeInfo.networkVersion })),
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(NodeInfoItem, { label: 'Network identifier', value: nodeInfo.networkIdentifier }),
                    React.createElement(NodeInfoItem, { label: 'Last block ID', value: nodeInfo.lastBlockID })),
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(NodeInfoItem, { label: 'Syncing', value: nodeInfo.syncing ? 'True' : 'False' }),
                    React.createElement(NodeInfoItem, { label: 'Unconfirmed transactions', value: nodeInfo.unconfirmedTransactions.toLocaleString() })),
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(NodeInfoItem, { label: 'Block time', value: nodeInfo.genesisConfig.blockTime.toLocaleString() }),
                    React.createElement(NodeInfoItem, { label: 'Community identifier', value: nodeInfo.genesisConfig.communityIdentifier })),
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(NodeInfoItem, { label: 'Max payload length', value: nodeInfo.genesisConfig.maxPayloadLength.toLocaleString() }),
                    React.createElement(NodeInfoItem, { label: 'BFT threshold', value: nodeInfo.genesisConfig.bftThreshold.toLocaleString() }))),
            React.createElement(Box_1.default, { mt: 5 },
                React.createElement(Text_1.default, { type: 'h2' }, "Base Fees")),
            React.createElement(Grid_1.default, { container: true, fluid: true, spacing: 3 },
                React.createElement(Grid_1.default, { row: true, rowBorder: true },
                    React.createElement(Grid_1.default, { xs: 4 },
                        React.createElement(Text_1.default, { type: 'h3' }, "Module ID")),
                    React.createElement(Grid_1.default, { xs: 4 },
                        React.createElement(Text_1.default, { type: 'h3' }, "Asset ID")),
                    React.createElement(Grid_1.default, { xs: 4 },
                        React.createElement(Text_1.default, { type: 'h3' }, "Base Fee"))),
                nodeInfo.genesisConfig.baseFees.map((fee, index) => (React.createElement(Grid_1.default, { row: true, rowBorder: index !== nodeInfo.genesisConfig.baseFees.length - 1, key: index },
                    React.createElement(Grid_1.default, { xs: 4 },
                        React.createElement(Text_1.default, null, fee.moduleID)),
                    React.createElement(Grid_1.default, { xs: 4 },
                        React.createElement(Text_1.default, null, fee.assetID)),
                    React.createElement(Grid_1.default, { xs: 4 },
                        React.createElement(Text_1.default, null, fee.baseFee)))))))));
};
exports.default = NodeInfoDialog;
//# sourceMappingURL=NodeInfoDialog.js.map