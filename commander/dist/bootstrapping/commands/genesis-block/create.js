"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptography = require("@liskhq/lisk-cryptography");
const command_1 = require("@oclif/command");
const fs = require("fs-extra");
const path_1 = require("path");
const inquirer = require("inquirer");
const ProgressBar = require("progress");
const genesis_creation_1 = require("../../../utils/genesis_creation");
const mnemonic_1 = require("../../../utils/mnemonic");
const saveFiles = (configPath, genesisBlock, accountList, delegateList, delegateForgingInfo, passwordList) => {
    fs.writeJSONSync(path_1.resolve(configPath, 'genesis_block.json'), genesisBlock, {
        spaces: ' ',
    });
    fs.writeJSONSync(path_1.resolve(configPath, 'accounts.json'), [...accountList, ...delegateList], {
        spaces: ' ',
    });
    fs.writeJSONSync(path_1.resolve(configPath, 'forging_info.json'), delegateForgingInfo, {
        spaces: ' ',
    });
    fs.writeJSONSync(path_1.resolve(configPath, 'password.json'), passwordList, {
        spaces: ' ',
    });
};
class BaseGenesisBlockCommand extends command_1.Command {
    async run() {
        const { flags: { output, accounts, validators, 'token-distribution': tokenDistribution }, } = this.parse(BaseGenesisBlockCommand);
        const regexWhitespace = /\s/g;
        const regexCamelCase = /^([a-z]+)(([A-Z]([a-z]+))+)$/;
        if (regexCamelCase.test(output) || regexWhitespace.test(output)) {
            this.error('Invalid name');
        }
        const app = this.getApplication({}, {});
        const registeredModules = app.getRegisteredModules();
        if (!registeredModules.some(module => module.name === 'token')) {
            throw new Error('Token module must be registered to use this command');
        }
        if (!registeredModules.some(module => module.name === 'dpos')) {
            throw new Error('Dpos module must be registered to use this command');
        }
        const schema = app.getSchema();
        const defaultAccount = app.getDefaultAccount();
        const { accountList, delegateList, genesisBlock } = genesis_creation_1.generateGenesisBlock({
            tokenDistribution,
            numOfValidators: validators,
            numOfAccounts: accounts,
            defaultAccount,
            schema,
        });
        const bar = new ProgressBar('  Creating genesis block [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: validators - 1,
        });
        const onionSeed = cryptography.generateHashOnionSeed();
        const onionCount = 10000;
        const onionDistance = 1000;
        const password = mnemonic_1.createMnemonicPassphrase();
        const passwordList = { defaultPassword: password };
        const delegateForgingInfo = delegateList.map((delegate, index) => {
            const info = {
                encryptedPassphrase: cryptography.stringifyEncryptedPassphrase(cryptography.encryptPassphraseWithPassword(delegate.passphrase, password)),
                hashOnion: {
                    count: onionCount,
                    distance: onionDistance,
                    hashes: cryptography
                        .hashOnion(onionSeed, onionCount, onionDistance)
                        .map(buf => buf.toString('hex')),
                },
                address: delegate.address,
            };
            if (index + 1 === validators) {
                bar.terminate();
            }
            else {
                bar.tick();
            }
            return info;
        });
        const configPath = path_1.join(process.cwd(), output);
        const filePath = path_1.join(configPath, 'genesis_block.json');
        if (fs.existsSync(filePath)) {
            const userResponse = await inquirer.prompt({
                type: 'confirm',
                name: 'confirm',
                message: 'A genesis_block file already exists at the given location. Do you want to overwrite it?',
            });
            if (!userResponse.confirm) {
                this.error(`Operation cancelled, genesis_block.json file already present at ${configPath}`);
            }
            else {
                saveFiles(configPath, genesisBlock, accountList, delegateList, delegateForgingInfo, passwordList);
                this.log('\n');
                this.log(`Configuration files saved at: ${configPath}.`);
            }
        }
        else {
            fs.mkdirSync(configPath, { recursive: true });
            saveFiles(configPath, genesisBlock, accountList, delegateList, delegateForgingInfo, passwordList);
            this.log(`Configuration files saved at: ${configPath}`);
        }
    }
}
exports.BaseGenesisBlockCommand = BaseGenesisBlockCommand;
BaseGenesisBlockCommand.description = 'Creates genesis block file.';
BaseGenesisBlockCommand.examples = [
    'genesis-block:create --output mydir',
    'genesis-block:create --output mydir --accounts 10',
    'genesis-block:create --output mydir --accounts 10 --validators 103',
    'genesis-block:create --output mydir --accounts 10 --validators 103 --token-distribution 500',
];
BaseGenesisBlockCommand.flags = {
    output: command_1.flags.string({
        char: 'o',
        description: 'Output folder path of the generated genesis block',
        default: 'config',
    }),
    accounts: command_1.flags.integer({
        char: 'a',
        description: 'Number of non-validator accounts to generate',
        default: 10,
    }),
    validators: command_1.flags.integer({
        char: 'v',
        description: 'Number of validator accounts to generate',
        default: 103,
    }),
    'token-distribution': command_1.flags.integer({
        char: 't',
        description: 'Amount of tokens distributed to each account',
        default: 10000000,
    }),
};
//# sourceMappingURL=create.js.map