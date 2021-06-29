"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flagsWithParser = exports.flags = void 0;
const command_1 = require("@oclif/command");
const constants_1 = require("../constants");
const messageDescription = `Specifies a source for providing a message to the command. If a string is provided directly as an argument, this option will be ignored. The message must be provided via an argument or via this option. Sources must be one of \`file\` or \`stdin\`. In the case of \`file\`, a corresponding identifier must also be provided.
	Note: if both secret passphrase and message are passed via stdin, the passphrase must be the first line.
	Examples:
	- --message=file:/path/to/my/message.txt
	- --message="hello world"
`;
const passphraseDescription = `Specifies a source for your secret passphrase. Command will prompt you for input if this option is not set.
	Examples:
	- --passphrase='my secret passphrase' (should only be used where security is not important)
`;
const passwordDescription = `Specifies a source for your secret password. Command will prompt you for input if this option is not set.
	Examples:
	- --password=pass:password123 (should only be used where security is not important)
`;
const networkIdentifierDescription = 'Network identifier defined for the network or main | test for the Lisk Network.';
const communityIdentifierDescription = 'Unique community identifier for network.';
const dataPathDescription = 'Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH" can also be used.';
const offlineDescription = 'Specify whether to connect to a local node or not.';
const networkDescription = 'Default network config to use. Environment variable "LISK_NETWORK" can also be used.';
const configDescription = 'File path to a custom config. Environment variable "LISK_CONFIG_FILE" can also be used.';
const prettyDescription = 'Prints JSON in pretty format rather than condensed.';
const outputDescription = 'The output directory. Default will set to current working directory.';
exports.flags = {
    message: {
        char: 'm',
        description: messageDescription,
    },
    passphrase: {
        char: 'p',
        description: passphraseDescription,
    },
    password: {
        char: 'w',
        description: passwordDescription,
    },
    networkIdentifier: {
        description: networkIdentifierDescription,
    },
    communityIdentifier: {
        description: communityIdentifierDescription,
    },
    dataPath: {
        char: 'd',
        description: dataPathDescription,
    },
    offline: {
        description: offlineDescription,
    },
    network: {
        char: 'n',
        description: networkDescription,
    },
    config: {
        char: 'c',
        description: configDescription,
    },
    pretty: {
        description: prettyDescription,
    },
    output: {
        char: 'o',
        description: outputDescription,
    },
    json: {
        char: 'j',
        description: 'Print the transaction in JSON format.',
    },
    senderPublicKey: {
        char: 's',
        description: 'Sign the transaction with provided sender public key, when passphrase is not provided',
    },
};
exports.flagsWithParser = {
    dataPath: command_1.flags.string({
        ...exports.flags.dataPath,
        env: 'LISK_DATA_PATH',
    }),
    network: command_1.flags.string({
        ...exports.flags.network,
        env: 'LISK_NETWORK',
        default: constants_1.DEFAULT_NETWORK,
    }),
    config: command_1.flags.string({
        ...exports.flags.config,
        env: 'LISK_CONFIG_FILE',
    }),
    pretty: command_1.flags.boolean(exports.flags.pretty),
    passphrase: command_1.flags.string(exports.flags.passphrase),
    output: command_1.flags.string(exports.flags.output),
    password: command_1.flags.string(exports.flags.password),
    offline: command_1.flags.boolean({
        ...exports.flags.offline,
    }),
    json: command_1.flags.boolean(exports.flags.json),
    senderPublicKey: command_1.flags.string(exports.flags.senderPublicKey),
    networkIdentifier: command_1.flags.string(exports.flags.networkIdentifier),
};
//# sourceMappingURL=flags.js.map