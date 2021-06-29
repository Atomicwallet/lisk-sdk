"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenModule = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const constants_1 = require("./constants");
const transfer_asset_1 = require("./transfer_asset");
const utils_1 = require("./utils");
const base_module_1 = require("../base_module");
const DEFAULT_MIN_REMAINING_BALANCE = '5000000';
class TokenModule extends base_module_1.BaseModule {
    constructor(genesisConfig) {
        super(genesisConfig);
        this.name = 'token';
        this.id = 2;
        this.accountSchema = {
            type: 'object',
            properties: {
                balance: {
                    fieldNumber: 1,
                    dataType: 'uint64',
                },
            },
            default: {
                balance: BigInt(0),
            },
        };
        this.reducers = {
            credit: async (params, stateStore) => {
                const { address, amount } = params;
                if (!Buffer.isBuffer(address)) {
                    throw new Error('Address must be a buffer');
                }
                if (typeof amount !== 'bigint') {
                    throw new Error('Amount must be a bigint');
                }
                if (amount <= BigInt(0)) {
                    throw new Error('Amount must be a positive bigint.');
                }
                const account = await stateStore.account.getOrDefault(address);
                account.token.balance += amount;
                if (account.token.balance < this._minRemainingBalance) {
                    throw new Error(`Remaining balance must be greater than ${this._minRemainingBalance.toString()}`);
                }
                await stateStore.account.set(address, account);
            },
            debit: async (params, stateStore) => {
                const { address, amount } = params;
                if (!Buffer.isBuffer(address)) {
                    throw new Error('Address must be a buffer');
                }
                if (typeof amount !== 'bigint') {
                    throw new Error('Amount must be a bigint');
                }
                if (amount <= BigInt(0)) {
                    throw new Error('Amount must be a positive bigint.');
                }
                const account = await stateStore.account.getOrDefault(address);
                account.token.balance -= amount;
                if (account.token.balance < this._minRemainingBalance) {
                    throw new Error(`Remaining balance must be greater than ${this._minRemainingBalance.toString()}`);
                }
                await stateStore.account.set(address, account);
            },
            getBalance: async (params, stateStore) => {
                const { address } = params;
                if (!Buffer.isBuffer(address)) {
                    throw new Error('Address must be a buffer');
                }
                const account = await stateStore.account.getOrDefault(address);
                return account.token.balance;
            },
            getMinRemainingBalance: async () => this._minRemainingBalance,
        };
        const minRemainingBalance = this.config.minRemainingBalance
            ? this.config.minRemainingBalance
            : DEFAULT_MIN_REMAINING_BALANCE;
        if (typeof minRemainingBalance !== 'string') {
            throw new Error('minRemainingBalance in genesisConfig must be a string.');
        }
        this._minRemainingBalance = BigInt(minRemainingBalance);
        this.transactionAssets = [new transfer_asset_1.TransferAsset(this._minRemainingBalance)];
    }
    async beforeTransactionApply({ transaction, stateStore, }) {
        const sender = await stateStore.account.get(transaction.senderAddress);
        sender.token.balance -= transaction.fee;
        await stateStore.account.set(transaction.senderAddress, sender);
    }
    async afterTransactionApply({ transaction, stateStore, }) {
        const sender = await stateStore.account.getOrDefault(transaction.senderAddress);
        if (sender.token.balance < this._minRemainingBalance) {
            throw new Error(`Account ${sender.address.toString('hex')} does not meet the minimum remaining balance requirement: ${this._minRemainingBalance.toString()}.`);
        }
    }
    async afterBlockApply({ block, stateStore }) {
        const generatorAddress = lisk_cryptography_1.getAddressFromPublicKey(block.header.generatorPublicKey);
        const generator = await stateStore.account.get(generatorAddress);
        generator.token.balance += block.header.reward;
        if (!block.payload.length) {
            await stateStore.account.set(generatorAddress, generator);
            return;
        }
        const { totalFee, totalMinFee } = utils_1.getTotalFees(block, BigInt(this.config.minFeePerByte), this.config.baseFees);
        const givenFee = totalFee - totalMinFee;
        generator.token.balance += givenFee;
        const totalFeeBurntBuffer = await stateStore.chain.get(constants_1.CHAIN_STATE_BURNT_FEE);
        let totalFeeBurnt = totalFeeBurntBuffer ? totalFeeBurntBuffer.readBigInt64BE() : BigInt(0);
        totalFeeBurnt += givenFee > 0 ? totalMinFee : BigInt(0);
        const updatedTotalBurntBuffer = Buffer.alloc(8);
        updatedTotalBurntBuffer.writeBigInt64BE(totalFeeBurnt);
        await stateStore.account.set(generatorAddress, generator);
        await stateStore.chain.set(constants_1.CHAIN_STATE_BURNT_FEE, updatedTotalBurntBuffer);
    }
    async afterGenesisBlockApply({ genesisBlock, }) {
        let totalBalance = BigInt(0);
        for (const account of genesisBlock.header.asset.accounts) {
            totalBalance += BigInt(account.token.balance);
        }
        if (totalBalance > constants_1.GENESIS_BLOCK_MAX_BALANCE) {
            throw new Error('Total balance exceeds the limit (2^63)-1');
        }
    }
}
exports.TokenModule = TokenModule;
//# sourceMappingURL=token_module.js.map