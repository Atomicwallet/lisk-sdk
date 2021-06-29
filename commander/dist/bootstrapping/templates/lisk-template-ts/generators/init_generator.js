"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path_1 = require("path");
const fs = require("fs-extra");
const Generator = require("yeoman-generator");
class InitGenerator extends Generator {
    async prompting() {
        this.answers = (await this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Application name',
                default: path_1.basename(this.destinationRoot()),
            },
            {
                type: 'input',
                name: 'description',
                message: 'Application description',
                default: 'Lisk-SDK Application',
            },
            {
                type: 'input',
                name: 'author',
                message: 'Author',
                default: os_1.userInfo().username,
            },
            {
                type: 'input',
                name: 'license',
                message: 'License',
                default: 'ISC',
            },
        ]));
    }
    createSkeleton() {
        const templatePath = path_1.join(__dirname, '..', 'templates');
        this.fs.copyTpl(`${templatePath}/init/**/*`, this.destinationRoot(), {
            appName: this.answers.name,
            appDescription: this.answers.description,
            author: this.answers.author,
            license: this.answers.license,
        }, {}, { globOptions: { dot: true, ignore: ['.DS_Store'] } });
        this.fs.move(this.destinationPath('package-template.json'), this.destinationPath('package.json'));
        this.fs.move(this.destinationPath('.gitignore-template'), this.destinationPath('.gitignore'));
    }
    end() {
        this.log('Generating genesis block and config.');
        this.spawnCommandSync(`${this.destinationPath('bin/run')}`, [
            'genesis-block:create',
            '--output',
            'config/default',
            '--validators-passphrase-encryption-iterations',
            '1',
            '--validators-hash-onion-count',
            '10000',
            '--validators-hash-onion-distance',
            '1000',
        ]);
        this.spawnCommandSync(`${this.destinationPath('bin/run')}`, [
            'config:create',
            '--output',
            'config/default',
        ]);
        const password = JSON.parse(fs.readFileSync(`${this.destinationPath('config/default/password.json')}`, 'utf8'));
        const forgingInfo = JSON.parse(fs.readFileSync(`${this.destinationPath('config/default/forging_info.json')}`, 'utf8'));
        const config = JSON.parse(fs.readFileSync(`${this.destinationPath('config/default/config.json')}`, 'utf8'));
        config.forging.force = true;
        config.forging.delegates = forgingInfo;
        config.forging.defaultPassword = password.defaultPassword;
        fs.writeJSONSync(`${this.destinationPath('config/default/config.json')}`, config, {
            spaces: '\t',
        });
        fs.unlinkSync(`${this.destinationPath('config/default/password.json')}`);
        fs.unlinkSync(`${this.destinationPath('config/default/forging_info.json')}`);
        fs.mkdirSync(`${this.destinationPath('.secrets/default')}`, { recursive: true });
        fs.renameSync(`${this.destinationPath('config/default/accounts.json')}`, `${this.destinationPath('.secrets/default/accounts.json')}`);
        this.log('"accounts.json" file saved at "./.secrets/default"');
        this.log('\nRun below command to start your blockchain app.\n');
        this.log(`cd ${this.destinationRoot()}; ./bin/run start`);
    }
}
exports.default = InitGenerator;
//# sourceMappingURL=init_generator.js.map