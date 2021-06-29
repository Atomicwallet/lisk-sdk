"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.calculateMinFee = exports.transactionSchema = void 0;
const lisk_codec_1 = require("@liskhq/lisk-codec");
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_validator_1 = require("@liskhq/lisk-validator");
exports.transactionSchema = {
    $id: 'lisk/transaction',
    type: 'object',
    required: ['moduleID', 'assetID', 'nonce', 'fee', 'senderPublicKey', 'asset'],
    properties: {
        moduleID: {
            dataType: 'uint32',
            fieldNumber: 1,
            minimum: 2,
        },
        assetID: {
            dataType: 'uint32',
            fieldNumber: 2,
        },
        nonce: {
            dataType: 'uint64',
            fieldNumber: 3,
        },
        fee: {
            dataType: 'uint64',
            fieldNumber: 4,
        },
        senderPublicKey: {
            dataType: 'bytes',
            fieldNumber: 5,
            minLength: 32,
            maxLength: 32,
        },
        asset: {
            dataType: 'bytes',
            fieldNumber: 6,
        },
        signatures: {
            type: 'array',
            items: {
                dataType: 'bytes',
            },
            fieldNumber: 7,
        },
    },
};
const calculateMinFee = (tx, minFeePerByte, baseFees) => {
    var _a, _b;
    const size = tx.getBytes().length;
    const baseFee = (_b = (_a = baseFees.find(bf => bf.moduleID === tx.moduleID && bf.assetID === tx.assetID)) === null || _a === void 0 ? void 0 : _a.baseFee) !== null && _b !== void 0 ? _b : '0';
    return BigInt(minFeePerByte * size) + BigInt(baseFee);
};
exports.calculateMinFee = calculateMinFee;
class Transaction {
    constructor(transaction) {
        this.moduleID = transaction.moduleID;
        this.assetID = transaction.assetID;
        this.asset = transaction.asset;
        this.nonce = transaction.nonce;
        this.fee = transaction.fee;
        this.senderPublicKey = transaction.senderPublicKey;
        this.signatures = transaction.signatures;
    }
    static decode(bytes) {
        const tx = lisk_codec_1.codec.decode(exports.transactionSchema, bytes);
        return new Transaction(tx);
    }
    get id() {
        if (!this._id) {
            this._id = lisk_cryptography_1.hash(this.getBytes());
        }
        return this._id;
    }
    get senderAddress() {
        if (!this._senderAddress) {
            this._senderAddress = lisk_cryptography_1.getAddressFromPublicKey(this.senderPublicKey);
        }
        return this._senderAddress;
    }
    getBytes() {
        const transactionBytes = lisk_codec_1.codec.encode(exports.transactionSchema, this);
        return transactionBytes;
    }
    getSigningBytes() {
        const transactionBytes = lisk_codec_1.codec.encode(exports.transactionSchema, {
            ...this,
            signatures: [],
        });
        return transactionBytes;
    }
    validate(input) {
        const schemaErrors = lisk_validator_1.validator.validate(exports.transactionSchema, this);
        if (schemaErrors.length > 0) {
            throw new lisk_validator_1.LiskValidationError(schemaErrors);
        }
        if (this.signatures.length === 0) {
            throw new Error('Signatures must not be empty');
        }
        for (const signature of this.signatures) {
            if (signature.length !== 0 && signature.length !== 64) {
                throw new Error('Signature must be empty or 64 bytes');
            }
        }
        const minFee = exports.calculateMinFee(this, input.minFeePerByte, input.baseFees);
        if (this.fee < minFee) {
            throw new Error(`Insufficient transaction fee. Minimum required fee is: ${minFee.toString()}`);
        }
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map