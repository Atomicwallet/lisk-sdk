"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lisk_framework_1 = require("lisk-framework");
var transactions_1 = require("./transactions");
try {
    var config = require('./helpers/config').config;
    var NETWORK = config.NETWORK;
    var genesisBlock = require("../config/" + NETWORK + "/genesis_block.json");
    var TRANSACTION_TYPES = {
        DAPP: 5,
        IN_TRANSFER: 6,
        OUT_TRANSFER: 7,
    };
    var app_1 = new lisk_framework_1.Application(genesisBlock, config);
    app_1.registerTransaction(TRANSACTION_TYPES.DAPP, transactions_1.DappTransaction, {
        matcher: function (context) {
            return context.blockHeight <
                app_1.config.modules.chain.exceptions.precedent.disableDappTransaction;
        },
    });
    app_1.registerTransaction(TRANSACTION_TYPES.IN_TRANSFER, transactions_1.InTransferTransaction, {
        matcher: function (context) {
            return context.blockHeight <
                app_1.config.modules.chain.exceptions.precedent.disableDappTransfer;
        },
    });
    app_1.registerTransaction(TRANSACTION_TYPES.OUT_TRANSFER, transactions_1.OutTransferTransaction, {
        matcher: function (context) {
            return context.blockHeight <
                app_1.config.modules.chain.exceptions.precedent.disableDappTransfer;
        },
    });
    app_1
        .run()
        .then(function () { return app_1.logger.info('App started...'); })
        .catch(function (error) {
        if (error instanceof Error) {
            app_1.logger.error('App stopped with error', error.message);
            app_1.logger.debug(error.stack);
        }
        else {
            app_1.logger.error('App stopped with error', error);
        }
        process.exit();
    });
}
catch (e) {
    console.error('Application start error.', e);
    process.exit();
}
//# sourceMappingURL=index.js.map