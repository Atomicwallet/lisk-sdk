"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = void 0;
const os = require("os");
const constants = require("./constants");
const accounts_1 = require("./resources/accounts");
const blocks_1 = require("./resources/blocks");
const dapps_1 = require("./resources/dapps");
const delegates_1 = require("./resources/delegates");
const node_1 = require("./resources/node");
const peers_1 = require("./resources/peers");
const signatures_1 = require("./resources/signatures");
const transactions_1 = require("./resources/transactions");
const voters_1 = require("./resources/voters");
const votes_1 = require("./resources/votes");
const defaultOptions = {
    bannedNodes: [],
    randomizeNodes: true,
};
const commonHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
const getClientHeaders = (clientOptions) => {
    const { name = '????', version = '????', engine = '????' } = clientOptions;
    const liskElementsInformation = 'LiskElements/1.0 (+https://github.com/LiskHQ/lisk-elements)';
    const locale = process.env.LC_ALL ||
        process.env.LC_MESSAGES ||
        process.env.LANG ||
        process.env.LANGUAGE;
    const systemInformation = `${os.platform()} ${os.release()}; ${os.arch()}${locale ? `; ${locale}` : ''}`;
    return {
        'User-Agent': `${name}/${version} (${engine}) ${liskElementsInformation} ${systemInformation}`,
    };
};
class APIClient {
    constructor(nodes, providedOptions = {}) {
        this.initialize(nodes, providedOptions);
        this.accounts = new accounts_1.AccountsResource(this);
        this.blocks = new blocks_1.BlocksResource(this);
        this.dapps = new dapps_1.DappsResource(this);
        this.delegates = new delegates_1.DelegatesResource(this);
        this.node = new node_1.NodeResource(this);
        this.peers = new peers_1.PeersResource(this);
        this.signatures = new signatures_1.SignaturesResource(this);
        this.transactions = new transactions_1.TransactionsResource(this);
        this.voters = new voters_1.VotersResource(this);
        this.votes = new votes_1.VotesResource(this);
    }
    static get constants() {
        return constants;
    }
    static createMainnetAPIClient(options) {
        return new APIClient(constants.MAINNET_NODES, Object.assign({ nethash: constants.MAINNET_NETHASH }, options));
    }
    static createTestnetAPIClient(options) {
        return new APIClient(constants.TESTNET_NODES, Object.assign({ nethash: constants.TESTNET_NETHASH }, options));
    }
    banActiveNode() {
        return this.banNode(this.currentNode);
    }
    banActiveNodeAndSelect() {
        const banned = this.banActiveNode();
        if (banned) {
            this.currentNode = this.getNewNode();
        }
        return banned;
    }
    banNode(node) {
        if (!this.isBanned(node)) {
            this.bannedNodes = [...this.bannedNodes, node];
            return true;
        }
        return false;
    }
    getNewNode() {
        const nodes = this.nodes.filter((node) => !this.isBanned(node));
        if (nodes.length === 0) {
            throw new Error('Cannot get new node: all nodes have been banned.');
        }
        const randomIndex = Math.floor(Math.random() * nodes.length);
        return nodes[randomIndex];
    }
    hasAvailableNodes() {
        return this.nodes.some((node) => !this.isBanned(node));
    }
    initialize(nodes, providedOptions = {}) {
        if (!Array.isArray(nodes) || nodes.length <= 0) {
            throw new Error('APIClient requires nodes for initialization.');
        }
        if (typeof providedOptions !== 'object' || Array.isArray(providedOptions)) {
            throw new Error('APIClient takes an optional object as the second parameter.');
        }
        const options = Object.assign(Object.assign({}, defaultOptions), providedOptions);
        this.headers = Object.assign(Object.assign(Object.assign({}, commonHeaders), (options.nethash ? { nethash: options.nethash } : {})), (options.client ? getClientHeaders(options.client) : {}));
        this.nodes = nodes;
        this.bannedNodes = [...(options.bannedNodes || [])];
        this.currentNode = options.node || this.getNewNode();
        this.randomizeNodes = options.randomizeNodes !== false;
    }
    isBanned(node) {
        return this.bannedNodes.includes(node);
    }
}
exports.APIClient = APIClient;
//# sourceMappingURL=api_client.js.map