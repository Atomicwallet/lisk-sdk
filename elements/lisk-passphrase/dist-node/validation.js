"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPassphraseValidationErrors = exports.locateConsecutiveWhitespaces = exports.locateUppercaseCharacters = exports.countUppercaseCharacters = exports.countPassphraseWords = exports.countPassphraseWhitespaces = void 0;
const Mnemonic = require("bip39");
const passphraseRegularExpression = {
    uppercaseRegExp: /[A-Z]/g,
    whitespaceRegExp: /\s/g,
};
const countPassphraseWhitespaces = (passphrase) => {
    const whitespaceMatches = passphrase.match(passphraseRegularExpression.whitespaceRegExp);
    return whitespaceMatches !== null ? whitespaceMatches.length : 0;
};
exports.countPassphraseWhitespaces = countPassphraseWhitespaces;
const countPassphraseWords = (passphrase) => passphrase.split(' ').filter(Boolean).length;
exports.countPassphraseWords = countPassphraseWords;
const countUppercaseCharacters = (passphrase) => {
    const uppercaseCharacterMatches = passphrase.match(passphraseRegularExpression.uppercaseRegExp);
    return uppercaseCharacterMatches !== null ? uppercaseCharacterMatches.length : 0;
};
exports.countUppercaseCharacters = countUppercaseCharacters;
const locateUppercaseCharacters = (passphrase) => passphrase
    .split('')
    .reduce((upperCaseIndexes, character, index) => {
    if (character.match(passphraseRegularExpression.uppercaseRegExp) !== null) {
        return [...upperCaseIndexes, index];
    }
    return upperCaseIndexes;
}, []);
exports.locateUppercaseCharacters = locateUppercaseCharacters;
const locateConsecutiveWhitespaces = (passphrase) => passphrase
    .split('')
    .reduce((whitespaceIndexes, character, index) => {
    if (index === 0 && character.match(passphraseRegularExpression.whitespaceRegExp) !== null) {
        return [...whitespaceIndexes, index];
    }
    if (index !== passphrase.length - 1 &&
        character.match(passphraseRegularExpression.whitespaceRegExp) !== null &&
        passphrase.split('')[index - 1].match(passphraseRegularExpression.whitespaceRegExp) !== null) {
        return [...whitespaceIndexes, index];
    }
    if (index === passphrase.length - 1 &&
        character.match(passphraseRegularExpression.whitespaceRegExp) !== null) {
        return [...whitespaceIndexes, index];
    }
    return whitespaceIndexes;
}, []);
exports.locateConsecutiveWhitespaces = locateConsecutiveWhitespaces;
const getPassphraseValidationErrors = (passphrase, wordlists, expectedWords = 12) => {
    const expectedWhitespaces = expectedWords - 1;
    const expectedUppercaseCharacterCount = 0;
    const wordsInPassphrase = exports.countPassphraseWords(passphrase);
    const whiteSpacesInPassphrase = exports.countPassphraseWhitespaces(passphrase);
    const uppercaseCharacterInPassphrase = exports.countUppercaseCharacters(passphrase);
    const passphraseWordError = {
        actual: wordsInPassphrase,
        code: 'INVALID_AMOUNT_OF_WORDS',
        expected: expectedWords,
        message: `Passphrase contains ${wordsInPassphrase.toString()} words instead of expected ${expectedWords.toString()}. Please check the passphrase.`,
    };
    const whiteSpaceError = {
        actual: whiteSpacesInPassphrase,
        code: 'INVALID_AMOUNT_OF_WHITESPACES',
        expected: expectedWhitespaces,
        location: exports.locateConsecutiveWhitespaces(passphrase),
        message: `Passphrase contains ${whiteSpacesInPassphrase.toString()} whitespaces instead of expected ${expectedWhitespaces.toString()}. Please check the passphrase.`,
    };
    const uppercaseCharacterError = {
        actual: uppercaseCharacterInPassphrase,
        code: 'INVALID_AMOUNT_OF_UPPERCASE_CHARACTER',
        expected: expectedUppercaseCharacterCount,
        location: exports.locateUppercaseCharacters(passphrase),
        message: `Passphrase contains ${uppercaseCharacterInPassphrase.toString()} uppercase character instead of expected ${expectedUppercaseCharacterCount.toString()}. Please check the passphrase.`,
    };
    const validationError = {
        actual: false,
        code: 'INVALID_MNEMONIC',
        expected: true,
        message: 'Passphrase is not a valid mnemonic passphrase. Please check the passphrase.',
    };
    const finalWordList = wordlists !== undefined ? [...wordlists] : Mnemonic.wordlists.english;
    return [passphraseWordError, whiteSpaceError, uppercaseCharacterError, validationError].reduce((errorArray, error) => {
        if (error.code === passphraseWordError.code && wordsInPassphrase !== expectedWords) {
            return [...errorArray, error];
        }
        if (error.code === whiteSpaceError.code && whiteSpacesInPassphrase !== expectedWhitespaces) {
            return [...errorArray, error];
        }
        if (error.code === uppercaseCharacterError.code &&
            uppercaseCharacterInPassphrase !== expectedUppercaseCharacterCount) {
            return [...errorArray, error];
        }
        if (error.code === validationError.code &&
            !Mnemonic.validateMnemonic(passphrase, finalWordList)) {
            return [...errorArray, error];
        }
        return errorArray;
    }, []);
};
exports.getPassphraseValidationErrors = getPassphraseValidationErrors;
//# sourceMappingURL=validation.js.map