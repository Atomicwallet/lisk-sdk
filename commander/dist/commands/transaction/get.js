"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var command_1 = require("@oclif/command");
var base_1 = tslib_1.__importDefault(require("../../base"));
var api_1 = require("../../utils/api");
var query_1 = require("../../utils/query");
var TRANSACTION_STATES = ['unsigned', 'unprocessed'];
var SORT_OPTIONS = [
    'amount:asc',
    'amount:desc',
    'fee:asc',
    'fee:desc',
    'type:asc',
    'type:desc',
    'timestamp:asc',
    'timestamp:desc',
];
var senderIdFlag = {
    description: "Get transactions based by sender-id which is sender's lisk address'.\n\tExamples:\n\t- --sender-id=12668885769632475474L\n",
};
var stateFlag = {
    char: 's',
    options: TRANSACTION_STATES,
    description: "Get transactions based on a given state. Possible values for the state are 'unsigned' and 'unprocessed'.\n\tExamples:\n\t- --state=unsigned\n\t- --state=unprocessed\n",
};
var GetCommand = (function (_super) {
    tslib_1.__extends(GetCommand, _super);
    function GetCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GetCommand.prototype.run = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, args, _b, limit, offset, sort, senderAddress, txnState, idsStr, ids, client, reqTxnSenderId, stateSenderIdsResult, reqTransactionIds, txnStateIdsResult, reqWithSenderId, txnStateSenderResult, reqByLimitOffset, txnStateResult, reqTransactionIDs, idsResult, reqSenderId, senderAddressResult, req, defaultResults;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.parse(GetCommand), args = _a.args, _b = _a.flags, limit = _b.limit, offset = _b.offset, sort = _b.sort, senderAddress = _b["sender-id"], txnState = _b.state;
                        idsStr = args.ids;
                        ids = idsStr ? idsStr.split(',').filter(Boolean) : undefined;
                        client = api_1.getAPIClient(this.userConfig.api);
                        if (!(txnState && senderAddress && ids)) return [3, 2];
                        reqTxnSenderId = ids.map(function (id) { return ({
                            query: {
                                limit: 1,
                                id: id,
                                senderId: senderAddress,
                            },
                            placeholder: {
                                id: id,
                                senderId: senderAddress,
                                message: 'Transaction not found.',
                            },
                        }); });
                        return [4, query_1.queryNodeTransaction(client.node, txnState, reqTxnSenderId)];
                    case 1:
                        stateSenderIdsResult = _c.sent();
                        this.print(stateSenderIdsResult);
                        return [2];
                    case 2:
                        if (!(txnState && ids)) return [3, 4];
                        reqTransactionIds = ids.map(function (id) { return ({
                            query: {
                                limit: 1,
                                id: id,
                            },
                            placeholder: {
                                id: id,
                                message: 'Transaction not found.',
                            },
                        }); });
                        return [4, query_1.queryNodeTransaction(client.node, txnState, reqTransactionIds)];
                    case 3:
                        txnStateIdsResult = _c.sent();
                        this.print(txnStateIdsResult);
                        return [2];
                    case 4:
                        if (!(txnState && senderAddress)) return [3, 6];
                        reqWithSenderId = [
                            {
                                query: {
                                    limit: limit,
                                    offset: offset,
                                    sort: sort,
                                    senderId: senderAddress,
                                },
                                placeholder: {
                                    senderId: senderAddress,
                                    message: 'Transaction not found.',
                                },
                            },
                        ];
                        return [4, query_1.queryNodeTransaction(client.node, txnState, reqWithSenderId)];
                    case 5:
                        txnStateSenderResult = _c.sent();
                        this.print(txnStateSenderResult);
                        return [2];
                    case 6:
                        if (!txnState) return [3, 8];
                        reqByLimitOffset = [
                            {
                                query: {
                                    limit: limit,
                                    offset: offset,
                                    sort: sort,
                                },
                                placeholder: {
                                    message: 'No transactions found.',
                                },
                            },
                        ];
                        return [4, query_1.queryNodeTransaction(client.node, txnState, reqByLimitOffset)];
                    case 7:
                        txnStateResult = _c.sent();
                        this.print(txnStateResult);
                        return [2];
                    case 8:
                        if (!ids) return [3, 10];
                        reqTransactionIDs = ids.map(function (id) { return ({
                            query: {
                                limit: 1,
                                id: id,
                            },
                            placeholder: {
                                id: id,
                                message: 'Transaction not found.',
                            },
                        }); });
                        return [4, query_1.query(client, 'transactions', reqTransactionIDs)];
                    case 9:
                        idsResult = _c.sent();
                        this.print(idsResult);
                        return [2];
                    case 10:
                        if (!senderAddress) return [3, 12];
                        reqSenderId = {
                            query: {
                                limit: limit,
                                offset: offset,
                                sort: sort,
                                senderId: senderAddress,
                            },
                            placeholder: {
                                message: 'No transactions found.',
                            },
                        };
                        return [4, query_1.query(client, 'transactions', reqSenderId)];
                    case 11:
                        senderAddressResult = _c.sent();
                        this.print(senderAddressResult);
                        return [2];
                    case 12:
                        req = {
                            query: {
                                limit: limit,
                                offset: offset,
                                sort: sort,
                            },
                            placeholder: {
                                message: 'No transactions found.',
                            },
                        };
                        return [4, query_1.query(client, 'transactions', req)];
                    case 13:
                        defaultResults = _c.sent();
                        this.print(defaultResults);
                        return [2];
                }
            });
        });
    };
    GetCommand.args = [
        {
            name: 'ids',
            required: false,
            description: 'Comma-separated transaction ID(s) to get information about.',
        },
    ];
    GetCommand.description = "\n\tGets transaction information from the blockchain.\n\t";
    GetCommand.examples = [
        'transaction:get 10041151099734832021',
        'transaction:get 10041151099734832021,1260076503909567890',
        'transaction:get 10041151099734832021,1260076503909567890 --state=unprocessed',
        'transaction:get --state=unsigned --sender-id=1813095620424213569L',
        'transaction:get 10041151099734832021 --state=unsigned --sender-id=1813095620424213569L',
        'transaction:get --sender-id=1813095620424213569L',
        'transaction:get --limit=10 --sort=amount:desc',
        'transaction:get --limit=10 --offset=5',
    ];
    GetCommand.flags = tslib_1.__assign({}, base_1.default.flags, { state: command_1.flags.string(stateFlag), 'sender-id': command_1.flags.string(senderIdFlag), limit: command_1.flags.string({
            description: 'Limits the returned transactions array by specified integer amount. Maximum is 100.',
            default: '10',
        }), offset: command_1.flags.string({
            description: 'Offsets the returned transactions array by specified integer amount.',
            default: '0',
        }), sort: command_1.flags.string({
            description: 'Fields to sort results by.',
            default: 'timestamp:desc',
            options: SORT_OPTIONS,
        }) });
    return GetCommand;
}(base_1.default));
exports.default = GetCommand;
//# sourceMappingURL=get.js.map