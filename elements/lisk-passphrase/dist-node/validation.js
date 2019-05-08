"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Mnemonic = require("bip39");
var passphraseRegularExpression = {
    uppercaseRegExp: /[A-Z]/g,
    whitespaceRegExp: /\s/g,
};
exports.countPassphraseWhitespaces = function (passphrase) {
    var whitespaceMatches = passphrase.match(passphraseRegularExpression.whitespaceRegExp);
    return whitespaceMatches !== null ? whitespaceMatches.length : 0;
};
exports.countPassphraseWords = function (passphrase) {
    return passphrase.split(' ').filter(Boolean).length;
};
exports.countUppercaseCharacters = function (passphrase) {
    var uppercaseCharacterMatches = passphrase.match(passphraseRegularExpression.uppercaseRegExp);
    return uppercaseCharacterMatches !== null
        ? uppercaseCharacterMatches.length
        : 0;
};
exports.locateUppercaseCharacters = function (passphrase) {
    return passphrase
        .split('')
        .reduce(function (upperCaseIndexes, character, index) {
        if (character.match(passphraseRegularExpression.uppercaseRegExp) !== null) {
            return __spread(upperCaseIndexes, [index]);
        }
        return upperCaseIndexes;
    }, []);
};
exports.locateConsecutiveWhitespaces = function (passphrase) {
    return passphrase
        .split('')
        .reduce(function (whitespaceIndexes, character, index) {
        if (index === 0 &&
            character.match(passphraseRegularExpression.whitespaceRegExp) !== null) {
            return __spread(whitespaceIndexes, [index]);
        }
        if (index !== passphrase.length - 1 &&
            character.match(passphraseRegularExpression.whitespaceRegExp) !==
                null &&
            passphrase
                .split('')[index - 1].match(passphraseRegularExpression.whitespaceRegExp) !==
                null) {
            return __spread(whitespaceIndexes, [index]);
        }
        if (index === passphrase.length - 1 &&
            character.match(passphraseRegularExpression.whitespaceRegExp) !== null) {
            return __spread(whitespaceIndexes, [index]);
        }
        return whitespaceIndexes;
    }, []);
};
exports.getPassphraseValidationErrors = function (passphrase, wordlists, expectedWords) {
    if (expectedWords === void 0) { expectedWords = 12; }
    var expectedWhitespaces = expectedWords - 1;
    var expectedUppercaseCharacterCount = 0;
    var wordsInPassphrase = exports.countPassphraseWords(passphrase);
    var whiteSpacesInPassphrase = exports.countPassphraseWhitespaces(passphrase);
    var uppercaseCharacterInPassphrase = exports.countUppercaseCharacters(passphrase);
    var passphraseWordError = {
        actual: wordsInPassphrase,
        code: 'INVALID_AMOUNT_OF_WORDS',
        expected: expectedWords,
        message: "Passphrase contains " + wordsInPassphrase + " words instead of expected " + expectedWords + ". Please check the passphrase.",
    };
    var whiteSpaceError = {
        actual: whiteSpacesInPassphrase,
        code: 'INVALID_AMOUNT_OF_WHITESPACES',
        expected: expectedWhitespaces,
        location: exports.locateConsecutiveWhitespaces(passphrase),
        message: "Passphrase contains " + whiteSpacesInPassphrase + " whitespaces instead of expected " + expectedWhitespaces + ". Please check the passphrase.",
    };
    var uppercaseCharacterError = {
        actual: uppercaseCharacterInPassphrase,
        code: 'INVALID_AMOUNT_OF_UPPERCASE_CHARACTER',
        expected: expectedUppercaseCharacterCount,
        location: exports.locateUppercaseCharacters(passphrase),
        message: "Passphrase contains " + uppercaseCharacterInPassphrase + " uppercase character instead of expected " + expectedUppercaseCharacterCount + ". Please check the passphrase.",
    };
    var validationError = {
        actual: false,
        code: 'INVALID_MNEMONIC',
        expected: true,
        message: 'Passphrase is not a valid mnemonic passphrase. Please check the passphrase.',
    };
    var finalWordList = wordlists !== undefined ? __spread(wordlists) : Mnemonic.wordlists.english;
    return [
        passphraseWordError,
        whiteSpaceError,
        uppercaseCharacterError,
        validationError,
    ].reduce(function (errorArray, error) {
        if (error.code === passphraseWordError.code &&
            wordsInPassphrase !== expectedWords) {
            return __spread(errorArray, [error]);
        }
        if (error.code === whiteSpaceError.code &&
            whiteSpacesInPassphrase !== expectedWhitespaces) {
            return __spread(errorArray, [error]);
        }
        if (error.code === uppercaseCharacterError.code &&
            uppercaseCharacterInPassphrase !== expectedUppercaseCharacterCount) {
            return __spread(errorArray, [error]);
        }
        if (error.code === validationError.code &&
            !Mnemonic.validateMnemonic(passphrase, finalWordList)) {
            return __spread(errorArray, [error]);
        }
        return errorArray;
    }, []);
};
//# sourceMappingURL=validation.js.map