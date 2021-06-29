"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetFromPrompt = exports.prepareQuestions = exports.transformNestedAsset = exports.transformAsset = exports.readStdIn = exports.readFileSource = exports.isFileSource = exports.getPasswordFromPrompt = exports.getPassphraseFromPrompt = void 0;
const liskPassphrase = require("@liskhq/lisk-passphrase");
const fs = require("fs");
const inquirer = require("inquirer");
const readline = require("readline");
const error_1 = require("./error");
const capitalise = (text) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
const getPromptVerificationFailError = (displayName) => `${capitalise(displayName)} was not successfully repeated.`;
const splitSource = (source) => {
    const delimiter = ':';
    const sourceParts = source.split(delimiter);
    return {
        sourceType: sourceParts[0],
        sourceIdentifier: sourceParts.slice(1).join(delimiter),
    };
};
const getPassphraseFromPrompt = async (displayName = 'passphrase', shouldConfirm = false) => {
    const questions = [
        {
            type: 'password',
            name: 'passphrase',
            message: `Please enter ${displayName}: `,
        },
    ];
    if (shouldConfirm) {
        questions.push({
            type: 'password',
            name: 'passphraseRepeat',
            message: `Please re-enter ${displayName}: `,
        });
    }
    const { passphrase, passphraseRepeat } = await inquirer.prompt(questions);
    if (!passphrase || (shouldConfirm && passphrase !== passphraseRepeat)) {
        throw new error_1.ValidationError(getPromptVerificationFailError(displayName));
    }
    const passphraseErrors = [passphrase]
        .filter(Boolean)
        .map(pass => liskPassphrase.validation
        .getPassphraseValidationErrors(pass)
        .filter((error) => error.message));
    passphraseErrors.forEach(errors => {
        if (errors.length > 0) {
            const passphraseWarning = errors
                .filter((error) => error.code !== 'INVALID_MNEMONIC')
                .reduce((accumulator, error) => accumulator.concat(`${error.message.replace(' Please check the passphrase.', '')} `), 'Warning: ');
            console.warn(passphraseWarning);
        }
    });
    return passphrase;
};
exports.getPassphraseFromPrompt = getPassphraseFromPrompt;
const getPasswordFromPrompt = async (displayName = 'password', shouldConfirm = false) => {
    const questions = [
        {
            type: 'password',
            name: 'password',
            message: `Please enter ${displayName}: `,
        },
    ];
    if (shouldConfirm) {
        questions.push({
            type: 'password',
            name: 'passwordRepeat',
            message: `Please re-enter ${displayName}: `,
        });
    }
    const { password, passwordRepeat } = await inquirer.prompt(questions);
    if (!password || (shouldConfirm && password !== passwordRepeat)) {
        throw new error_1.ValidationError(getPromptVerificationFailError(displayName));
    }
    return password;
};
exports.getPasswordFromPrompt = getPasswordFromPrompt;
const getFileDoesNotExistError = (path) => `File at ${path} does not exist.`;
const getFileUnreadableError = (path) => `File at ${path} could not be read.`;
const getDataFromFile = (path) => fs.readFileSync(path, 'utf8');
const ERROR_DATA_MISSING = 'No data was provided.';
const ERROR_DATA_SOURCE = 'Unknown data source type.';
const isFileSource = (source) => {
    if (!source) {
        return false;
    }
    const delimiter = ':';
    const sourceParts = source.split(delimiter);
    if (sourceParts.length === 2 && sourceParts[0] === 'file') {
        return true;
    }
    return false;
};
exports.isFileSource = isFileSource;
const readFileSource = async (source) => {
    if (!source) {
        throw new error_1.ValidationError(ERROR_DATA_MISSING);
    }
    const { sourceType, sourceIdentifier: path } = splitSource(source);
    if (sourceType !== 'file') {
        throw new error_1.ValidationError(ERROR_DATA_SOURCE);
    }
    try {
        return getDataFromFile(path);
    }
    catch (error) {
        const { message } = error;
        if (message.match(/ENOENT/)) {
            throw new error_1.FileSystemError(getFileDoesNotExistError(path));
        }
        if (message.match(/EACCES/)) {
            throw new error_1.FileSystemError(getFileUnreadableError(path));
        }
        throw error;
    }
};
exports.readFileSource = readFileSource;
const DEFAULT_TIMEOUT = 100;
const readStdIn = async () => {
    const readFromStd = new Promise((resolve, reject) => {
        const lines = [];
        const rl = readline.createInterface({ input: process.stdin });
        setTimeout(() => {
            reject(new Error(`Timed out after ${DEFAULT_TIMEOUT} ms`));
        }, DEFAULT_TIMEOUT);
        const handleClose = () => {
            resolve(lines);
        };
        return rl.on('line', line => lines.push(line)).on('close', handleClose);
    });
    return readFromStd;
};
exports.readStdIn = readStdIn;
const getNestedPropertyTemplate = (schema) => {
    const keyValEntries = Object.entries(schema.properties);
    const template = {};
    for (let i = 0; i < keyValEntries.length; i += 1) {
        const [schemaPropertyName, schemaPropertyValue] = keyValEntries[i];
        if (schemaPropertyValue.type === 'array') {
            if (schemaPropertyValue.items.type === 'object') {
                template[schemaPropertyName] = Object.keys(schemaPropertyValue.items.properties);
            }
        }
    }
    return template;
};
const castValue = (val, schemaType) => {
    if (schemaType === 'object') {
        return JSON.parse(val);
    }
    if (schemaType === 'array') {
        return val.split(',');
    }
    if (schemaType === 'uint64' || schemaType === 'sint64') {
        return BigInt(val);
    }
    if (schemaType === 'uint32' || schemaType === 'sint32') {
        return Number(val);
    }
    return val;
};
const transformAsset = (schema, data) => {
    const propertySchema = Object.values(schema.properties);
    const assetData = {};
    return Object.entries(data).reduce((acc, curr, index) => {
        const propSchema = propertySchema[index];
        const schemaType = propSchema.type || propSchema.dataType;
        acc[curr[0]] = castValue(curr[1], schemaType);
        return acc;
    }, assetData);
};
exports.transformAsset = transformAsset;
const transformNestedAsset = (schema, data) => {
    const template = getNestedPropertyTemplate(schema);
    const result = {};
    const items = [];
    for (const assetData of data) {
        const [[key, val]] = Object.entries(assetData);
        const templateValues = template[key];
        const initData = {};
        const valObject = val.split(',').reduce((acc, curr, index) => {
            acc[templateValues[index]] = Number.isInteger(Number(curr)) ? Number(curr) : curr;
            return acc;
        }, initData);
        items.push(valObject);
        result[key] = items;
    }
    return result;
};
exports.transformNestedAsset = transformNestedAsset;
const prepareQuestions = (schema) => {
    const keyValEntries = Object.entries(schema.properties);
    const questions = [];
    for (const [schemaPropertyName, schemaPropertyValue] of keyValEntries) {
        if (schemaPropertyValue.type === 'array') {
            let commaSeparatedKeys = [];
            if (schemaPropertyValue.items.type === 'object') {
                commaSeparatedKeys = Object.keys(schemaPropertyValue.items.properties);
            }
            questions.push({
                type: 'input',
                name: schemaPropertyName,
                message: `Please enter: ${schemaPropertyName}(${commaSeparatedKeys.length ? commaSeparatedKeys.join(', ') : 'comma separated values (a,b)'}): `,
            });
            if (schemaPropertyValue.items.type === 'object') {
                questions.push({
                    type: 'confirm',
                    name: 'askAgain',
                    message: `Want to enter another ${schemaPropertyName}(${commaSeparatedKeys.join(', ')})`,
                });
            }
        }
        else {
            questions.push({
                type: 'input',
                name: schemaPropertyName,
                message: `Please enter: ${schemaPropertyName}: `,
            });
        }
    }
    return questions;
};
exports.prepareQuestions = prepareQuestions;
const getAssetFromPrompt = async (assetSchema, output = []) => {
    const questions = exports.prepareQuestions(assetSchema);
    let isTypeConfirm = false;
    const result = await inquirer.prompt(questions).then(async (answer) => {
        const inquirerResult = answer;
        isTypeConfirm = typeof inquirerResult.askAgain === 'boolean';
        if (inquirerResult.askAgain) {
            output.push(inquirerResult);
            return exports.getAssetFromPrompt(assetSchema, output);
        }
        output.push(inquirerResult);
        return Promise.resolve(answer);
    });
    const filteredResult = output.map(({ askAgain, ...assetProps }) => assetProps);
    return isTypeConfirm
        ? exports.transformNestedAsset(assetSchema, filteredResult)
        : exports.transformAsset(assetSchema, result);
};
exports.getAssetFromPrompt = getAssetFromPrompt;
//# sourceMappingURL=reader.js.map