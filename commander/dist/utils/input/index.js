"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var passphraseModule = tslib_1.__importStar(require("@liskhq/lisk-passphrase"));
var utils_1 = require("./utils");
exports.getFirstLineFromString = function (multilineString) {
    return typeof multilineString === 'string'
        ? multilineString.split(/[\r\n]+/)[0]
        : undefined;
};
exports.getInputsFromSources = function (_a) {
    var passphraseInput = _a.passphrase, secondPassphraseInput = _a.secondPassphrase, passwordInput = _a.password, dataInput = _a.data;
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var _b, passphraseIsRequired, secondPassphraseIsRequired, passwordIsRequired, dataIsRequired, stdIn, passphrase, _c, secondPassphrase, _d, passphraseErrors, password, _e, data, _f;
        return tslib_1.__generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _b = tslib_1.__read([passphraseInput, secondPassphraseInput, passwordInput, dataInput].map(function (input) { return !!input && input.source === 'stdin'; }), 4), passphraseIsRequired = _b[0], secondPassphraseIsRequired = _b[1], passwordIsRequired = _b[2], dataIsRequired = _b[3];
                    return [4, utils_1.getStdIn({
                            passphraseIsRequired: passphraseIsRequired,
                            secondPassphraseIsRequired: secondPassphraseIsRequired,
                            passwordIsRequired: passwordIsRequired,
                            dataIsRequired: dataIsRequired,
                        })];
                case 1:
                    stdIn = _g.sent();
                    if (!(typeof stdIn.passphrase !== 'string' && passphraseInput)) return [3, 3];
                    return [4, utils_1.getPassphrase(passphraseInput.source, {
                            shouldRepeat: passphraseInput.repeatPrompt,
                        })];
                case 2:
                    _c = _g.sent();
                    return [3, 4];
                case 3:
                    _c = stdIn.passphrase || undefined;
                    _g.label = 4;
                case 4:
                    passphrase = _c;
                    if (!(typeof stdIn.secondPassphrase !== 'string' && secondPassphraseInput)) return [3, 6];
                    return [4, utils_1.getPassphrase(secondPassphraseInput.source, {
                            displayName: 'your second secret passphrase',
                            shouldRepeat: secondPassphraseInput.repeatPrompt,
                        })];
                case 5:
                    _d = _g.sent();
                    return [3, 7];
                case 6:
                    _d = stdIn.secondPassphrase || undefined;
                    _g.label = 7;
                case 7:
                    secondPassphrase = _d;
                    passphraseErrors = [passphrase, secondPassphrase]
                        .filter(Boolean)
                        .map(function (pass) {
                        return passphraseModule.validation
                            .getPassphraseValidationErrors(pass)
                            .filter(function (error) { return error.message; });
                    });
                    passphraseErrors.forEach(function (errors) {
                        if (errors.length > 0) {
                            var passphraseWarning = errors
                                .filter(function (error) { return error.code !== 'INVALID_MNEMONIC'; })
                                .reduce(function (accumulator, error) {
                                return accumulator.concat(error.message.replace(' Please check the passphrase.', '') + " ");
                            }, 'Warning: ');
                            console.warn(passphraseWarning);
                        }
                    });
                    if (!(typeof stdIn.password !== 'string' && passwordInput)) return [3, 9];
                    return [4, utils_1.getPassphrase(passwordInput.source, {
                            displayName: 'your password',
                            shouldRepeat: passwordInput.repeatPrompt,
                        })];
                case 8:
                    _e = _g.sent();
                    return [3, 10];
                case 9:
                    _e = stdIn.password || undefined;
                    _g.label = 10;
                case 10:
                    password = _e;
                    if (!(typeof stdIn.data !== 'string' && dataInput)) return [3, 12];
                    return [4, utils_1.getData(dataInput.source)];
                case 11:
                    _f = _g.sent();
                    return [3, 13];
                case 12:
                    _f = stdIn.data || undefined;
                    _g.label = 13;
                case 13:
                    data = _f;
                    return [2, {
                            passphrase: passphrase,
                            secondPassphrase: secondPassphrase,
                            password: password,
                            data: data,
                        }];
            }
        });
    });
};
//# sourceMappingURL=index.js.map