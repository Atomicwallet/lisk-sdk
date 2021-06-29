"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const dialog_1 = require("../dialog");
const Text_1 = require("../Text");
const Grid_1 = require("../Grid");
const Box_1 = require("../Box");
const Icon_1 = require("../Icon");
const PeersInfoDialog_module_scss_1 = require("./PeersInfoDialog.module.scss");
const PeersInfoDialog = props => {
    const { peersInfo, ...rest } = props;
    return (React.createElement(dialog_1.Dialog, Object.assign({}, rest),
        React.createElement(dialog_1.DialogHeader, null,
            React.createElement(Text_1.default, { type: 'h1' }, "Peers Info")),
        React.createElement(dialog_1.DialogBody, null,
            React.createElement(Box_1.default, { className: PeersInfoDialog_module_scss_1.default.infoRow },
                React.createElement(Grid_1.default, { container: true, fluid: true, spacing: 3 },
                    React.createElement(Grid_1.default, { row: true },
                        React.createElement(Grid_1.default, { md: 4, xs: 12 },
                            React.createElement(Box_1.default, { className: PeersInfoDialog_module_scss_1.default.infoBlockIcon },
                                React.createElement(Icon_1.default, { name: 'link', size: 'xl' })),
                            React.createElement(Box_1.default, null,
                                React.createElement(Text_1.default, null, "Connected"),
                                React.createElement(Text_1.default, { type: 'h1' }, peersInfo.connected))),
                        React.createElement(Grid_1.default, { md: 4, xs: 12 },
                            React.createElement(Box_1.default, { className: PeersInfoDialog_module_scss_1.default.infoBlockIcon },
                                React.createElement(Icon_1.default, { name: 'link_off', size: 'xl' })),
                            React.createElement(Box_1.default, null,
                                React.createElement(Text_1.default, null, "Disconnected"),
                                React.createElement(Text_1.default, { type: 'h1' }, peersInfo.disconnected))),
                        React.createElement(Grid_1.default, { md: 4, xs: 12 },
                            React.createElement(Box_1.default, { className: PeersInfoDialog_module_scss_1.default.infoBlockIcon },
                                React.createElement(Icon_1.default, { name: 'remove_done', size: 'xl' })),
                            React.createElement(Box_1.default, null,
                                React.createElement(Text_1.default, null, "Banned"),
                                React.createElement(Text_1.default, { type: 'h1' }, peersInfo.banned)))))))));
};
exports.default = PeersInfoDialog;
//# sourceMappingURL=PeersInfoDialog.js.map