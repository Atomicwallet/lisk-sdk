"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_client_1 = require("@liskhq/lisk-client");
const React = require("react");
const Box_1 = require("../components/Box");
const Button_1 = require("../components/Button");
const CopiableText_1 = require("../components/CopiableText");
const AccountDialog_1 = require("../components/dialogs/AccountDialog");
const NodeInfoDialog_1 = require("../components/dialogs/NodeInfoDialog");
const PeersInfoDialog_1 = require("../components/dialogs/PeersInfoDialog");
const Grid_1 = require("../components/Grid");
const InfoPanel_1 = require("../components/InfoPanel");
const input_1 = require("../components/input");
const Logo_1 = require("../components/Logo");
const Text_1 = require("../components/Text");
const Ticker_1 = require("../components/Ticker");
const widgets_1 = require("../components/widgets");
const CallActionWidget_1 = require("../components/widgets/CallActionWidget");
const MyAccountWidget_1 = require("../components/widgets/MyAccountWidget");
const SendTransactionWidget_1 = require("../components/widgets/SendTransactionWidget");
const useMessageDialog_1 = require("../providers/useMessageDialog");
const utils_1 = require("../utils");
const useRefState_1 = require("../utils/useRefState");
const MainPage_module_scss_1 = require("./MainPage.module.scss");
const nodeInfoDefaultValue = {
    version: '',
    networkVersion: '',
    networkIdentifier: '',
    syncing: false,
    unconfirmedTransactions: 0,
    height: 0,
    finalizedHeight: 0,
    lastBlockID: '',
    registeredModules: [],
    genesisConfig: {
        communityIdentifier: '',
        blockTime: 0,
        maxPayloadLength: 0,
        bftThreshold: 0,
        rewards: { milestones: [], offset: 0, distance: 0 },
        minFeePerByte: 0,
        baseFees: [],
    },
};
const MAX_RECENT_EVENT = 100;
const connectionErrorMessage = (React.createElement(Text_1.default, { type: 'h3' }, "There were some error and we were unable to connect to node. Try again by refreshing the page."));
const callAndProcessActions = async (client, action, params) => {
    let result = (await client.invoke(action, params));
    switch (action) {
        case 'app:getAccount':
            result = client.account.toJSON(client.account.decode(result));
            break;
        case 'app:getAccounts':
            result = result.map(account => client.account.toJSON(client.account.decode(account)));
            break;
        case 'app:getLastBlock':
        case 'app:getBlockByID':
        case 'app:getBlockByHeight':
            result = client.block.toJSON(client.block.decode(result));
            break;
        case 'app:getBlocksByHeightBetween':
        case 'app:getBlocksByIDs':
            result = result.map(block => client.block.toJSON(client.block.decode(block)));
            break;
        case 'app:getTransactionByID':
            result = client.transaction.toJSON(client.transaction.decode(result));
            break;
        case 'app:getTransactionsByIDs':
            result = result.map(transaction => client.transaction.toJSON(client.transaction.decode(transaction)));
            break;
        default:
            break;
    }
    return result;
};
const MainPage = () => {
    const { showMessageDialog } = useMessageDialog_1.default();
    const [client, setClient] = React.useState();
    const getClient = () => client;
    const [myAccounts, setMyAccounts] = React.useState([]);
    const [dashboard, setDashboard] = React.useState({
        connected: false,
    });
    const [nodeInfo, setNodeInfo] = React.useState(nodeInfoDefaultValue);
    const [peersInfo, setPeerInfo] = React.useState({ connected: 0, disconnected: 0, banned: 0 });
    const [blocks, setBlocks, blocksRef] = useRefState_1.default([]);
    const [confirmedTransactions, setConfirmedTransactions, confirmedTransactionsRef] = useRefState_1.default([]);
    const [unconfirmedTransactions, setUnconfirmedTransactions, unconfirmedTransactionsRef,] = useRefState_1.default([]);
    const [events, setEvents] = React.useState([]);
    const [eventsData, setEventsData, eventsDataRef] = useRefState_1.default([]);
    const [eventSubscriptionList, setEventSubscriptionList, eventSubscriptionListRef] = useRefState_1.default([]);
    const [actions, setActions] = React.useState([]);
    const [showAccount, setShowAccount] = React.useState();
    const [nodeInfoDialog, setNodeInfoDialog] = React.useState(false);
    const [peersInfoDialog, setPeersInfoDialog] = React.useState(false);
    const newBlockListener = React.useCallback(async (event) => {
        const result = utils_1.updateStatesOnNewBlock(getClient(), event.block, blocksRef.current, confirmedTransactionsRef.current, unconfirmedTransactionsRef.current);
        setBlocks(result.blocks);
        setConfirmedTransactions(result.confirmedTransactions);
        setUnconfirmedTransactions(result.unconfirmedTransactions);
        await loadNodeInfo();
    }, [dashboard.connected]);
    const newTransactionListener = React.useCallback(event => {
        setUnconfirmedTransactions(utils_1.updateStatesOnNewTransaction(getClient(), event.transaction, unconfirmedTransactionsRef.current));
    }, [dashboard.connected]);
    const newEventListener = React.useCallback((name, event) => {
        if (eventSubscriptionListRef.current.includes(name)) {
            eventsDataRef.current.unshift({ name, data: event !== null && event !== void 0 ? event : {} });
            const recentEventsData = eventsDataRef.current.slice(-1 * MAX_RECENT_EVENT);
            setEventsData(recentEventsData);
        }
    }, [dashboard.connected]);
    const initClient = async () => {
        try {
            setClient(await lisk_client_1.apiClient.createWSClient(dashboard.applicationUrl));
            setDashboard({ ...dashboard, connected: true });
        }
        catch {
            showMessageDialog('Error connecting to node', connectionErrorMessage);
        }
    };
    const subscribeEvents = async () => {
        getClient().subscribe('app:block:new', newBlockListener);
        getClient().subscribe('app:transaction:new', newTransactionListener);
        setActions(await getClient().invoke('app:getRegisteredActions'));
        const listOfEvents = await getClient().invoke('app:getRegisteredEvents');
        listOfEvents.map(eventName => getClient().subscribe(eventName, event => {
            newEventListener(eventName, event);
        }));
        setEvents(listOfEvents);
    };
    const loadNodeInfo = async () => {
        setNodeInfo(await getClient().node.getNodeInfo());
    };
    const loadPeersInfo = async () => {
        const info = await getClient().node.getNetworkStats();
        setPeerInfo({
            connected: info.totalConnectedPeers,
            disconnected: info.totalDisconnectedPeers,
            banned: info.banning.count,
        });
    };
    const generateNewAccount = () => {
        const accountPassphrase = lisk_client_1.passphrase.Mnemonic.generateMnemonic();
        const { address, publicKey } = lisk_client_1.cryptography.getAddressAndPublicKeyFromPassphrase(accountPassphrase);
        const lisk32Address = lisk_client_1.cryptography.getBase32AddressFromAddress(address);
        const newAccount = {
            passphrase: accountPassphrase,
            publicKey: publicKey.toString('hex'),
            binaryAddress: address.toString('hex'),
            base32Address: lisk32Address,
        };
        setMyAccounts([newAccount, ...myAccounts]);
        setShowAccount(newAccount);
    };
    React.useEffect(() => {
        const initConfig = async () => {
            setDashboard({ ...dashboard, ...(await utils_1.getConfig()) });
        };
        initConfig().catch(console.error);
    }, []);
    React.useEffect(() => {
        if (dashboard.applicationUrl) {
            initClient().catch(console.error);
        }
    }, [dashboard.applicationUrl]);
    React.useEffect(() => {
        if (dashboard.connected) {
            subscribeEvents().catch(console.error);
            loadNodeInfo().catch(console.error);
            loadPeersInfo().catch(console.error);
        }
    }, [dashboard.connected]);
    React.useEffect(() => {
        setEventsData([]);
    }, [eventSubscriptionList]);
    const handleSendTransaction = async (data) => {
        try {
            const { publicKey, address } = lisk_client_1.cryptography.getAddressAndPublicKeyFromPassphrase(data.passphrase);
            const assetSchema = getClient().schemas.transactionsAssets.find(a => a.moduleID === data.moduleID && a.assetID === data.assetID);
            if (!assetSchema) {
                throw new Error(`ModuleID: ${data.moduleID} AssetID: ${data.assetID} is not registered`);
            }
            const assetObject = lisk_client_1.codec.codec.fromJSON(assetSchema.schema, data.asset);
            const sender = await getClient().account.get(address);
            const fee = getClient().transaction.computeMinFee({
                moduleID: data.moduleID,
                assetID: data.assetID,
                asset: assetObject,
                senderPublicKey: publicKey,
                nonce: BigInt(sender.sequence.nonce),
            });
            const transaction = await getClient().transaction.create({
                moduleID: data.moduleID,
                assetID: data.assetID,
                asset: assetObject,
                senderPublicKey: publicKey,
                fee,
            }, data.passphrase);
            const resp = await getClient().transaction.send(transaction);
            showMessageDialog('Success!', React.createElement(React.Fragment, null,
                React.createElement(Text_1.default, { type: 'p' }, "Transaction with following id received:"),
                React.createElement(CopiableText_1.default, { text: resp.transactionId })), { backButton: true });
        }
        catch (err) {
            showMessageDialog('Error:', React.createElement(React.Fragment, null,
                React.createElement(Text_1.default, { type: 'p', color: 'red' }, err.message)));
        }
    };
    const handleCallAction = async (data) => {
        try {
            const result = await callAndProcessActions(getClient(), data.name, data.params);
            showMessageDialog('Success!', React.createElement(input_1.TextAreaInput, { json: true, readonly: true, size: 'l', value: JSON.stringify(result, undefined, '  ') }), { backButton: true });
        }
        catch (err) {
            showMessageDialog('Error:', React.createElement(React.Fragment, null,
                React.createElement(Text_1.default, { type: 'p', color: 'red' }, err.message)));
        }
    };
    const CurrentHeightPanel = () => (React.createElement(InfoPanel_1.default, { title: 'Current height' },
        React.createElement(Text_1.default, { color: "green", type: "h1", style: "light" }, nodeInfo.height.toLocaleString())));
    const FinalizedHeightPanel = () => (React.createElement(InfoPanel_1.default, { title: 'Finalized height' },
        React.createElement(Text_1.default, { color: "pink", type: "h1", style: "light" }, nodeInfo.finalizedHeight.toLocaleString())));
    const NextBlockPanel = () => (React.createElement(InfoPanel_1.default, { title: 'Next block' },
        React.createElement(Ticker_1.default, { color: "yellow", type: "h1", style: "light", seconds: nodeInfo.genesisConfig.blockTime })));
    const PeersInfoPanel = () => (React.createElement(InfoPanel_1.default, { title: 'Peers', onClick: () => setPeersInfoDialog(true) },
        React.createElement(Text_1.default, { color: "blue", type: "h1", style: "light" }, peersInfo.connected)));
    const NodeInfoPanel = () => (React.createElement(InfoPanel_1.default, { mode: 'light', title: 'Node Info', onClick: () => setNodeInfoDialog(true) },
        React.createElement(Text_1.default, { color: "white", type: "p" },
            "Version: ",
            nodeInfo.version)));
    return (React.createElement("section", { className: MainPage_module_scss_1.default.root },
        React.createElement(Grid_1.default, { container: true, rowSpacing: 6 },
            React.createElement(Grid_1.default, { row: true, alignItems: 'center' },
                React.createElement(Grid_1.default, { xs: 6, md: 8 },
                    React.createElement(Logo_1.default, { name: dashboard.applicationName })),
                React.createElement(Grid_1.default, { xs: 6, md: 4, textAlign: 'right' },
                    React.createElement(Button_1.default, { onClick: () => {
                            generateNewAccount();
                        } }, "Generate new account")))),
        React.createElement(Box_1.default, { showUp: 'md', hideDown: 'md' },
            React.createElement(Grid_1.default, { container: true, columns: 15, colSpacing: 2 },
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(Grid_1.default, { xs: 3 },
                        React.createElement(CurrentHeightPanel, null)),
                    React.createElement(Grid_1.default, { xs: 3 },
                        React.createElement(FinalizedHeightPanel, null)),
                    React.createElement(Grid_1.default, { xs: 3 },
                        React.createElement(NextBlockPanel, null)),
                    React.createElement(Grid_1.default, { xs: 3 },
                        React.createElement(PeersInfoPanel, null)),
                    React.createElement(Grid_1.default, { xs: 3 },
                        React.createElement(NodeInfoPanel, null))))),
        React.createElement(Box_1.default, { hideUp: 'xs', showDown: 'md' },
            React.createElement(Grid_1.default, { container: true, columns: 12, colSpacing: 2 },
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(Grid_1.default, { xs: 6 },
                        React.createElement(CurrentHeightPanel, null)),
                    React.createElement(Grid_1.default, { xs: 6 },
                        React.createElement(FinalizedHeightPanel, null))),
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(Grid_1.default, { xs: 6 },
                        React.createElement(NextBlockPanel, null)),
                    React.createElement(Grid_1.default, { xs: 6 },
                        React.createElement(PeersInfoPanel, null))),
                React.createElement(Grid_1.default, { row: true },
                    React.createElement(Grid_1.default, { xs: 12 },
                        React.createElement(NodeInfoPanel, null))))),
        React.createElement(Grid_1.default, { container: true, columns: 12, colSpacing: 3, rowSpacing: 3 },
            React.createElement(Grid_1.default, { row: true },
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(MyAccountWidget_1.default, { accounts: myAccounts, onSelect: account => setShowAccount(account) })),
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(widgets_1.BlockWidget, { title: "Recent Blocks", blocks: blocks }))),
            React.createElement(Grid_1.default, { row: true },
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(widgets_1.TransactionWidget, { title: "Recent Transactions", nodeInfo: nodeInfo, transactions: confirmedTransactions })),
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(widgets_1.TransactionWidget, { title: "Unconfirmed Transactions", nodeInfo: nodeInfo, transactions: unconfirmedTransactions }))),
            React.createElement(Grid_1.default, { row: true },
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(SendTransactionWidget_1.default, { modules: nodeInfo.registeredModules, onSubmit: data => {
                            handleSendTransaction(data).catch(console.error);
                        } })),
                React.createElement(Grid_1.default, { md: 6, xs: 12 },
                    React.createElement(CallActionWidget_1.default, { actions: actions, onSubmit: data => {
                            handleCallAction(data).catch(console.error);
                        } }))),
            React.createElement(Grid_1.default, { row: true },
                React.createElement(Grid_1.default, { xs: 12 },
                    React.createElement(widgets_1.RecentEventWidget, { events: events, onSelect: selectedEvents => setEventSubscriptionList(selectedEvents), selected: [], data: eventsData }))),
            React.createElement(Grid_1.default, { row: true },
                React.createElement(Grid_1.default, { xs: 12 },
                    React.createElement(Text_1.default, null, "\u00A9 2021 Lisk Foundation")))),
        React.createElement(AccountDialog_1.default, { open: !!showAccount, onClose: () => {
                setShowAccount(undefined);
            }, account: showAccount }),
        React.createElement(PeersInfoDialog_1.default, { open: peersInfoDialog, onClose: () => {
                setPeersInfoDialog(false);
            }, peersInfo: peersInfo }),
        React.createElement(NodeInfoDialog_1.default, { open: nodeInfoDialog, onClose: () => {
                setNodeInfoDialog(false);
            }, nodeInfo: nodeInfo })));
};
exports.default = MainPage;
//# sourceMappingURL=MainPage.js.map