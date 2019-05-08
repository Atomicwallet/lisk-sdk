"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var constants = require("./constants");
var accounts_1 = require("./resources/accounts");
var blocks_1 = require("./resources/blocks");
var dapps_1 = require("./resources/dapps");
var delegates_1 = require("./resources/delegates");
var node_1 = require("./resources/node");
var peers_1 = require("./resources/peers");
var signatures_1 = require("./resources/signatures");
var transactions_1 = require("./resources/transactions");
var voters_1 = require("./resources/voters");
var votes_1 = require("./resources/votes");
var defaultOptions = {
    bannedNodes: [],
    randomizeNodes: true,
};
var commonHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
var getClientHeaders = function (clientOptions) {
    var _a = clientOptions.name, name = _a === void 0 ? '????' : _a, _b = clientOptions.version, version = _b === void 0 ? '????' : _b, _c = clientOptions.engine, engine = _c === void 0 ? '????' : _c;
    var liskElementsInformation = 'LiskElements/1.0 (+https://github.com/LiskHQ/lisk-elements)';
    var locale = process.env.LC_ALL ||
        process.env.LC_MESSAGES ||
        process.env.LANG ||
        process.env.LANGUAGE;
    var systemInformation = os.platform() + " " + os.release() + "; " + os.arch() + (locale ? "; " + locale : '');
    return {
        'User-Agent': name + "/" + version + " (" + engine + ") " + liskElementsInformation + " " + systemInformation,
    };
};
var APIClient = (function () {
    function APIClient(nodes, providedOptions) {
        if (providedOptions === void 0) { providedOptions = {}; }
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
    Object.defineProperty(APIClient, "constants", {
        get: function () {
            return constants;
        },
        enumerable: true,
        configurable: true
    });
    APIClient.createMainnetAPIClient = function (options) {
        return new APIClient(constants.MAINNET_NODES, __assign({ nethash: constants.MAINNET_NETHASH }, options));
    };
    APIClient.createTestnetAPIClient = function (options) {
        return new APIClient(constants.TESTNET_NODES, __assign({ nethash: constants.TESTNET_NETHASH }, options));
    };
    APIClient.prototype.banActiveNode = function () {
        return this.banNode(this.currentNode);
    };
    APIClient.prototype.banActiveNodeAndSelect = function () {
        var banned = this.banActiveNode();
        if (banned) {
            this.currentNode = this.getNewNode();
        }
        return banned;
    };
    APIClient.prototype.banNode = function (node) {
        if (!this.isBanned(node)) {
            this.bannedNodes = __spread(this.bannedNodes, [node]);
            return true;
        }
        return false;
    };
    APIClient.prototype.getNewNode = function () {
        var _this = this;
        var nodes = this.nodes.filter(function (node) { return !_this.isBanned(node); });
        if (nodes.length === 0) {
            throw new Error('Cannot get new node: all nodes have been banned.');
        }
        var randomIndex = Math.floor(Math.random() * nodes.length);
        return nodes[randomIndex];
    };
    APIClient.prototype.hasAvailableNodes = function () {
        var _this = this;
        return this.nodes.some(function (node) { return !_this.isBanned(node); });
    };
    APIClient.prototype.initialize = function (nodes, providedOptions) {
        if (providedOptions === void 0) { providedOptions = {}; }
        if (!Array.isArray(nodes) || nodes.length <= 0) {
            throw new Error('APIClient requires nodes for initialization.');
        }
        if (typeof providedOptions !== 'object' || Array.isArray(providedOptions)) {
            throw new Error('APIClient takes an optional object as the second parameter.');
        }
        var options = __assign({}, defaultOptions, providedOptions);
        this.headers = __assign({}, commonHeaders, (options.nethash ? { nethash: options.nethash } : {}), (options.client ? getClientHeaders(options.client) : {}));
        this.nodes = nodes;
        this.bannedNodes = __spread((options.bannedNodes || []));
        this.currentNode = options.node || this.getNewNode();
        this.randomizeNodes = options.randomizeNodes !== false;
    };
    APIClient.prototype.isBanned = function (node) {
        return this.bannedNodes.includes(node);
    };
    return APIClient;
}());
exports.APIClient = APIClient;
//# sourceMappingURL=api_client.js.map