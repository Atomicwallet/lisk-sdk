"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forger = void 0;
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const lisk_chain_1 = require("@liskhq/lisk-chain");
const lisk_tree_1 = require("@liskhq/lisk-tree");
const lisk_utils_1 = require("@liskhq/lisk-utils");
const strategies_1 = require("./strategies");
const data_access_1 = require("./data_access");
const BLOCK_VERSION = 2;
const isSyncedWithNetwork = (lastBlockHeader, forgingInput) => {
    if (lastBlockHeader.version === 0) {
        return (forgingInput.height <= lastBlockHeader.height &&
            forgingInput.maxHeightPrevoted <= lastBlockHeader.height);
    }
    return (forgingInput.maxHeightPrevoted < lastBlockHeader.asset.maxHeightPrevoted ||
        (forgingInput.maxHeightPrevoted === lastBlockHeader.asset.maxHeightPrevoted &&
            forgingInput.height < lastBlockHeader.height));
};
class Forger {
    constructor({ forgingStrategy, logger, db, processorModule, bftModule, transactionPoolModule, chainModule, forgingDelegates, forgingForce, forgingDefaultPassword, forgingWaitThreshold, }) {
        this._keypairs = new lisk_utils_1.dataStructures.BufferMap();
        this._logger = logger;
        this._db = db;
        this._config = {
            forging: {
                delegates: forgingDelegates,
                force: forgingForce,
                defaultPassword: forgingDefaultPassword,
                waitThreshold: forgingWaitThreshold,
            },
        };
        this._processorModule = processorModule;
        this._bftModule = bftModule;
        this._transactionPoolModule = transactionPoolModule;
        this._chainModule = chainModule;
        this._forgingStrategy =
            forgingStrategy !== null && forgingStrategy !== void 0 ? forgingStrategy : new strategies_1.HighFeeForgingStrategy({
                transactionPoolModule: this._transactionPoolModule,
                chainModule: this._chainModule,
                maxPayloadLength: this._chainModule.constants.maxPayloadLength,
                processorModule: this._processorModule,
            });
    }
    delegatesEnabled() {
        return this._keypairs.values().length > 0;
    }
    async updateForgingStatus(forgerAddress, password, forging, height, maxHeightPreviouslyForged, maxHeightPrevoted, overwrite) {
        const encryptedForgers = this._config.forging.delegates;
        const encryptedForger = encryptedForgers === null || encryptedForgers === void 0 ? void 0 : encryptedForgers.find(item => item.address.equals(forgerAddress));
        let passphrase;
        if (!encryptedForger) {
            throw new Error(`Delegate with address: ${forgerAddress.toString('hex')} not found`);
        }
        try {
            passphrase = lisk_cryptography_1.decryptPassphraseWithPassword(lisk_cryptography_1.parseEncryptedPassphrase(encryptedForger.encryptedPassphrase), password);
        }
        catch (e) {
            throw new Error('Invalid password and public key combination');
        }
        const keypair = lisk_cryptography_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
        if (!lisk_cryptography_1.getAddressFromPublicKey(keypair.publicKey).equals(forgerAddress)) {
            throw new Error(`Invalid keypair: ${lisk_cryptography_1.getAddressFromPublicKey(keypair.publicKey).toString('hex')}  and address: ${forgerAddress.toString('hex')} combination`);
        }
        if (!forging) {
            this._keypairs.delete(forgerAddress);
            this._logger.info(`Forging disabled on account: ${forgerAddress.toString('hex')}`);
            return {
                address: forgerAddress,
                forging,
            };
        }
        const lastBlockHeader = this._chainModule.lastBlock.header;
        const previouslyForgedMap = await data_access_1.getPreviouslyForgedMap(this._db);
        const forgingInput = { height, maxHeightPreviouslyForged, maxHeightPrevoted };
        if (!isSyncedWithNetwork(lastBlockHeader, forgingInput)) {
            throw new Error('Failed to enable forging as the node is not synced to the network.');
        }
        if (!overwrite &&
            (height !== 0 || maxHeightPrevoted !== 0 || maxHeightPreviouslyForged !== 0)) {
            if (!previouslyForgedMap.has(forgerAddress)) {
                throw new Error('Failed to enable forging due to missing forger info.');
            }
            const forgerInfo = previouslyForgedMap.get(forgerAddress);
            if ((forgerInfo === null || forgerInfo === void 0 ? void 0 : forgerInfo.height) !== height ||
                (forgerInfo === null || forgerInfo === void 0 ? void 0 : forgerInfo.maxHeightPrevoted) !== maxHeightPrevoted ||
                (forgerInfo === null || forgerInfo === void 0 ? void 0 : forgerInfo.maxHeightPreviouslyForged) !== maxHeightPreviouslyForged) {
                throw new Error('Failed to enable forging due to contradicting forger info.');
            }
        }
        else {
            previouslyForgedMap.set(forgerAddress, {
                height,
                maxHeightPrevoted,
                maxHeightPreviouslyForged,
            });
            await data_access_1.setPreviouslyForgedMap(this._db, previouslyForgedMap);
            this._logger.info(forgingInput, 'Updated forgerInfo');
        }
        this._keypairs.set(forgerAddress, keypair);
        this._logger.info(`Forging enabled on account: ${forgerAddress.toString('hex')}`);
        return {
            address: forgerAddress,
            forging,
        };
    }
    async loadDelegates() {
        const encryptedList = this._config.forging.delegates;
        if (!(encryptedList === null || encryptedList === void 0 ? void 0 : encryptedList.length) ||
            !this._config.forging.force ||
            !this._config.forging.defaultPassword) {
            return;
        }
        this._logger.info(`Loading ${encryptedList.length} delegates using encrypted passphrases from config`);
        let usedHashOnions = await data_access_1.getUsedHashOnions(this._db);
        const registeredHashOnionSeeds = await data_access_1.getRegisteredHashOnionSeeds(this._db);
        for (const encryptedItem of encryptedList) {
            let passphrase;
            try {
                passphrase = lisk_cryptography_1.decryptPassphraseWithPassword(lisk_cryptography_1.parseEncryptedPassphrase(encryptedItem.encryptedPassphrase), this._config.forging.defaultPassword);
            }
            catch (error) {
                const decryptionError = `Invalid encryptedPassphrase for address: ${encryptedItem.address.toString('hex')}. ${error.message}`;
                this._logger.error(decryptionError);
                throw new Error(decryptionError);
            }
            const keypair = lisk_cryptography_1.getPrivateAndPublicKeyFromPassphrase(passphrase);
            const delegateAddress = lisk_cryptography_1.getAddressFromPublicKey(keypair.publicKey);
            if (!delegateAddress.equals(encryptedItem.address)) {
                throw new Error(`Invalid encryptedPassphrase for address: ${encryptedItem.address.toString('hex')}. Address do not match`);
            }
            const validatorAddress = lisk_cryptography_1.getAddressFromPublicKey(keypair.publicKey);
            const account = await this._chainModule.dataAccess.getAccountByAddress(validatorAddress);
            this._keypairs.set(validatorAddress, keypair);
            this._logger.info(`Forging enabled on account: ${account.address.toString('hex')}`);
            const registeredHashOnionSeed = registeredHashOnionSeeds.get(account.address);
            const hashOnionConfig = this._getHashOnionConfig(account.address);
            const configHashOnionSeed = hashOnionConfig.hashes[hashOnionConfig.hashes.length - 1];
            if (registeredHashOnionSeed && !registeredHashOnionSeed.equals(configHashOnionSeed)) {
                this._logger.warn(`Hash onion for Account ${account.address.toString('hex')} is not the same as previous one. Overwriting with new hash onion`);
                usedHashOnions = usedHashOnions.filter(ho => !ho.address.equals(account.address));
            }
            registeredHashOnionSeeds.set(account.address, configHashOnionSeed);
            const highestUsedHashOnion = usedHashOnions.reduce((prev, current) => {
                if (!current.address.equals(account.address)) {
                    return prev;
                }
                if (!prev || prev.count < current.count) {
                    return current;
                }
                return prev;
            }, undefined);
            if (!highestUsedHashOnion) {
                continue;
            }
            const { count: highestCount } = highestUsedHashOnion;
            if (highestCount > hashOnionConfig.count - hashOnionConfig.distance) {
                this._logger.warn({
                    hashOnionUsed: highestCount,
                }, `Number of hashonion used(${highestCount}) is close to end. Please update to the new hash onion`);
            }
            if (highestCount >= hashOnionConfig.count) {
                throw new Error(`All of the hash onion is used for ${account.address.toString('hex')}`);
            }
        }
        await data_access_1.setRegisteredHashOnionSeeds(this._db, registeredHashOnionSeeds);
        await data_access_1.setUsedHashOnions(this._db, usedHashOnions);
    }
    async forge() {
        const MS_IN_A_SEC = 1000;
        const currentSlot = this._chainModule.slots.getSlotNumber();
        const currentSlotTime = this._chainModule.slots.getSlotTime(currentSlot);
        const currentTime = Math.floor(new Date().getTime() / MS_IN_A_SEC);
        const { waitThreshold } = this._config.forging;
        const { lastBlock } = this._chainModule;
        const lastBlockSlot = this._chainModule.slots.getSlotNumber(lastBlock.header.timestamp);
        if (currentSlot === lastBlockSlot) {
            this._logger.trace({ slot: currentSlot }, 'Block already forged for the current slot');
            return;
        }
        const validator = await this._chainModule.getValidator(currentTime);
        if (!validator) {
            this._logger.debug({ currentSlot: this._chainModule.slots.getSlotNumber() }, 'No validator is set for current time slot');
            return;
        }
        const validatorKeypair = this._keypairs.get(validator.address);
        if (validatorKeypair === undefined) {
            this._logger.debug({ currentSlot: this._chainModule.slots.getSlotNumber() }, 'Waiting for delegate slot');
            return;
        }
        if (lastBlockSlot < currentSlot - 1 && currentTime <= currentSlotTime + waitThreshold) {
            this._logger.info('Skipping forging to wait for last block');
            this._logger.debug({
                currentSlot,
                lastBlockSlot,
                waitThreshold,
            }, 'Slot information');
            return;
        }
        const timestamp = currentSlotTime;
        const previousBlock = this._chainModule.lastBlock;
        const transactions = await this._forgingStrategy.getTransactionsForBlock();
        const delegateAddress = lisk_cryptography_1.getAddressFromPublicKey(validatorKeypair.publicKey);
        const nextHeight = previousBlock.header.height + 1;
        const usedHashOnions = await data_access_1.getUsedHashOnions(this._db);
        const nextHashOnion = this._getNextHashOnion(usedHashOnions, delegateAddress, nextHeight);
        const index = usedHashOnions.findIndex(ho => ho.address.equals(delegateAddress) && ho.count === nextHashOnion.count);
        const nextUsedHashOnion = {
            count: nextHashOnion.count,
            address: delegateAddress,
            height: nextHeight,
        };
        if (index > -1) {
            usedHashOnions[index] = nextUsedHashOnion;
        }
        else {
            usedHashOnions.push(nextUsedHashOnion);
        }
        const updatedUsedHashOnion = this._filterUsedHashOnions(usedHashOnions, this._bftModule.finalizedHeight);
        const forgedBlock = await this._create({
            keypair: validatorKeypair,
            timestamp,
            transactions,
            previousBlock,
            seedReveal: nextHashOnion.hash,
        });
        await data_access_1.setUsedHashOnions(this._db, updatedUsedHashOnion);
        await this._processorModule.process(forgedBlock);
        this._logger.info({
            id: forgedBlock.header.id,
            generatorAddress: delegateAddress,
            seedReveal: nextHashOnion.hash,
            height: forgedBlock.header.height,
            slot: this._chainModule.slots.getSlotNumber(forgedBlock.header.timestamp),
            reward: forgedBlock.header.reward.toString(),
        }, 'Forged new block');
    }
    getForgersKeyPairs() {
        return this._keypairs;
    }
    async getForgingStatusOfAllDelegates() {
        const forgingDelegates = this._config.forging.delegates;
        const forgersAddress = new lisk_utils_1.dataStructures.BufferSet();
        for (const keypair of this._keypairs.values()) {
            forgersAddress.add(lisk_cryptography_1.getAddressFromPublicKey(keypair.publicKey));
        }
        const previouslyForgedMap = await data_access_1.getPreviouslyForgedMap(this._db);
        const fullList = forgingDelegates === null || forgingDelegates === void 0 ? void 0 : forgingDelegates.map(forger => ({
            forging: forgersAddress.has(forger.address),
            address: forger.address,
            ...(previouslyForgedMap.has(forger.address) ? previouslyForgedMap.get(forger.address) : {}),
        }));
        return fullList;
    }
    _getNextHashOnion(usedHashOnions, address, height) {
        const usedHashOnion = usedHashOnions.reduce((prev, current) => {
            if (!current.address.equals(address)) {
                return prev;
            }
            if (current.height < height &&
                (!prev || prev.height < current.height)) {
                return current;
            }
            return prev;
        }, undefined);
        const hashOnionConfig = this._getHashOnionConfig(address);
        if (!usedHashOnion) {
            return {
                hash: hashOnionConfig.hashes[0],
                count: 0,
            };
        }
        const { count: usedCount } = usedHashOnion;
        const nextCount = usedCount + 1;
        if (nextCount > hashOnionConfig.count) {
            this._logger.warn('All of the hash onion has been used already. Please update to the new hash onion.');
            return {
                hash: lisk_cryptography_1.generateHashOnionSeed(),
                count: 0,
            };
        }
        const nextCheckpointIndex = Math.ceil(nextCount / hashOnionConfig.distance);
        const nextCheckpoint = hashOnionConfig.hashes[nextCheckpointIndex];
        const hashes = lisk_cryptography_1.hashOnion(nextCheckpoint, hashOnionConfig.distance, 1);
        const checkpointIndex = nextCount % hashOnionConfig.distance;
        return {
            hash: hashes[checkpointIndex],
            count: nextCount,
        };
    }
    _getHashOnionConfig(address) {
        var _a;
        const delegateConfig = (_a = this._config.forging.delegates) === null || _a === void 0 ? void 0 : _a.find(d => d.address.equals(address));
        if (!(delegateConfig === null || delegateConfig === void 0 ? void 0 : delegateConfig.hashOnion)) {
            throw new Error(`Account ${address.toString('hex')} does not have hash onion in the config`);
        }
        return delegateConfig.hashOnion;
    }
    _filterUsedHashOnions(usedHashOnions, finalizedHeight) {
        const filteredObject = usedHashOnions.reduce(({ others, highest }, current) => {
            const prevUsed = highest.get(current.address);
            if (prevUsed === undefined) {
                highest.set(current.address, current);
            }
            else if (prevUsed.height < current.height) {
                others.push(prevUsed);
                highest.set(current.address, current);
            }
            return {
                highest,
                others,
            };
        }, {
            others: [],
            highest: new lisk_utils_1.dataStructures.BufferMap(),
        });
        const filtered = filteredObject.others.filter(ho => ho.height > finalizedHeight);
        return filtered.concat(filteredObject.highest.values());
    }
    async _create({ transactions, keypair, seedReveal, timestamp, previousBlock, }) {
        var _a;
        const previouslyForgedMap = await data_access_1.getPreviouslyForgedMap(this._db);
        const delegateAddress = lisk_cryptography_1.getAddressFromPublicKey(keypair.publicKey);
        const height = previousBlock.header.height + 1;
        const previousBlockID = previousBlock.header.id;
        const forgerInfo = previouslyForgedMap.get(delegateAddress);
        const maxHeightPreviouslyForged = (_a = forgerInfo === null || forgerInfo === void 0 ? void 0 : forgerInfo.height) !== null && _a !== void 0 ? _a : 0;
        const maxHeightPrevoted = await this._bftModule.getMaxHeightPrevoted();
        const stateStore = await this._chainModule.newStateStore();
        const reward = this._chainModule.calculateDefaultReward(height);
        let size = 0;
        const blockTransactions = [];
        const transactionIds = [];
        for (const transaction of transactions) {
            const transactionBytes = transaction.getBytes();
            if (size + transactionBytes.length > this._chainModule.constants.maxPayloadLength) {
                break;
            }
            size += transactionBytes.length;
            blockTransactions.push(transaction);
            transactionIds.push(transaction.id);
        }
        const transactionRoot = new lisk_tree_1.MerkleTree(transactionIds).root;
        const header = {
            version: BLOCK_VERSION,
            height,
            reward,
            transactionRoot,
            previousBlockID,
            timestamp,
            generatorPublicKey: keypair.publicKey,
            asset: {
                seedReveal,
                maxHeightPreviouslyForged,
                maxHeightPrevoted,
            },
        };
        const isBFTProtocolCompliant = await this._bftModule.isBFTProtocolCompliant(header, stateStore);
        if (!isBFTProtocolCompliant) {
            header.reward /= BigInt(4);
            this._logger.warn({ originalReward: reward.toString(), deductedReward: header.reward.toString() }, 'Deducting reward due to BFT violation');
        }
        const validSeedReveal = this._chainModule.isValidSeedReveal(header, stateStore);
        if (!validSeedReveal) {
            const originalReward = header.reward.toString();
            header.reward = BigInt(0);
            this._logger.warn({ originalReward, deductedReward: header.reward.toString() }, 'Deducting reward due to SeedReveal violation');
        }
        const headerBytesWithoutSignature = this._chainModule.dataAccess.encodeBlockHeader(header, true);
        const signature = lisk_cryptography_1.signDataWithPrivateKey(lisk_chain_1.TAG_BLOCK_HEADER, this._chainModule.constants.networkIdentifier, headerBytesWithoutSignature, keypair.privateKey);
        const headerBytes = this._chainModule.dataAccess.encodeBlockHeader({
            ...header,
            signature,
        });
        const id = lisk_cryptography_1.hash(headerBytes);
        const block = {
            header: {
                ...header,
                signature,
                id,
            },
            payload: blockTransactions,
        };
        await data_access_1.saveMaxHeightPreviouslyForged(this._db, block.header, previouslyForgedMap);
        return block;
    }
}
exports.Forger = Forger;
//# sourceMappingURL=forger.js.map