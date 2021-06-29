"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_cryptography_1 = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const base_1 = require("../base");
const flags_1 = require("../utils/flags");
class NetworkIdentifierCommand extends base_1.default {
    async run() {
        const { flags: { 'community-identifier': communityIdentifier }, args: { genesisBlockID }, } = this.parse(NetworkIdentifierCommand);
        const networkIdentifier = lisk_cryptography_1.getNetworkIdentifier(Buffer.from(genesisBlockID, 'hex'), communityIdentifier);
        this.print({ networkIdentifier: networkIdentifier.toString('hex') });
    }
}
exports.default = NetworkIdentifierCommand;
NetworkIdentifierCommand.description = 'Creates Network identifier for the given genesis block id and community identifier.';
NetworkIdentifierCommand.examples = [
    'network-identifier da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba',
];
NetworkIdentifierCommand.args = [
    {
        name: 'genesisBlockID',
        description: 'ID of genesis block from the network.',
        required: true,
    },
];
NetworkIdentifierCommand.flags = {
    ...base_1.default.flags,
    'community-identifier': command_1.flags.string({
        ...flags_1.flags.communityIdentifier,
        default: 'Lisk',
    }),
};
//# sourceMappingURL=network-identifier.js.map