'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var fs_1 = tslib_1.__importDefault(require('fs'));
var inquirer_1 = tslib_1.__importDefault(require('inquirer'));
var readline_1 = tslib_1.__importDefault(require('readline'));
var error_1 = require('../error');
var helpers_1 = require('../helpers');
var capitalise = function(text) {
	return '' + text.charAt(0).toUpperCase() + text.slice(1);
};
var getPassphraseVerificationFailError = function(displayName) {
	return capitalise(displayName) + ' was not successfully repeated.';
};
var getPassphraseSourceTypeUnknownError = function(displayName) {
	return (
		capitalise(displayName) +
		' was provided with an unknown source type. Must be one of `env`, `file`, or `stdin`. Leave blank for prompt.'
	);
};
var getPassphraseEnvVariableNotSetError = function(displayName) {
	return 'Environmental variable for ' + displayName + ' not set.';
};
var getFileDoesNotExistError = function(path) {
	return 'File at ' + path + ' does not exist.';
};
var getFileUnreadableError = function(path) {
	return 'File at ' + path + ' could not be read.';
};
var ERROR_DATA_MISSING = 'No data was provided.';
var ERROR_DATA_SOURCE = 'Unknown data source type.';
var DEFAULT_TIMEOUT = 100;
exports.splitSource = function(source) {
	var delimiter = ':';
	var sourceParts = source.split(delimiter);
	return {
		sourceType: sourceParts[0],
		sourceIdentifier: sourceParts.slice(1).join(delimiter),
	};
};
exports.getStdIn = function(_a) {
	var _b = _a === void 0 ? {} : _a,
		passphraseIsRequired = _b.passphraseIsRequired,
		secondPassphraseIsRequired = _b.secondPassphraseIsRequired,
		passwordIsRequired = _b.passwordIsRequired,
		dataIsRequired = _b.dataIsRequired;
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var readFromStd;
		return tslib_1.__generator(this, function(_c) {
			readFromStd = new Promise(function(resolve, reject) {
				if (
					!(
						passphraseIsRequired ||
						secondPassphraseIsRequired ||
						passwordIsRequired ||
						dataIsRequired
					)
				) {
					resolve({});
					return;
				}
				var lines = [];
				var rl = readline_1.default.createInterface({ input: process.stdin });
				var id = setTimeout(function() {
					clearTimeout(id);
					reject(new Error('Timed out after ' + DEFAULT_TIMEOUT + ' ms'));
				}, DEFAULT_TIMEOUT);
				var handleClose = function() {
					var passphraseIndex = 0;
					var passphrase = passphraseIsRequired
						? lines[passphraseIndex]
						: undefined;
					var secondPassphraseIndex =
						passphraseIndex + (passphrase !== undefined ? 1 : 0);
					var secondPassphrase = secondPassphraseIsRequired
						? lines[secondPassphraseIndex]
						: undefined;
					var passwordIndex =
						secondPassphraseIndex + (secondPassphrase !== undefined ? 1 : 0);
					var password = passwordIsRequired ? lines[passwordIndex] : undefined;
					var dataStartIndex = passwordIndex + (password !== undefined ? 1 : 0);
					var dataLines = lines.slice(dataStartIndex);
					resolve({
						passphrase: passphrase,
						secondPassphrase: secondPassphrase,
						password: password,
						data: dataLines.length ? dataLines.join('\n') : undefined,
					});
					return;
				};
				return rl
					.on('line', function(line) {
						return lines.push(line);
					})
					.on('close', handleClose);
			});
			return [2, readFromStd];
		});
	});
};
exports.getPassphraseFromPrompt = function(_a) {
	var displayName = _a.displayName,
		shouldRepeat = _a.shouldRepeat;
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var questions, _b, passphrase, passphraseRepeat;
		return tslib_1.__generator(this, function(_c) {
			switch (_c.label) {
				case 0:
					questions = [
						{
							type: 'password',
							name: 'passphrase',
							message: 'Please enter ' + displayName + ': ',
						},
					];
					if (shouldRepeat) {
						questions.push({
							type: 'password',
							name: 'passphraseRepeat',
							message: 'Please re-enter ' + displayName + ': ',
						});
					}
					if (!helpers_1.stdoutIsTTY() || !helpers_1.stdinIsTTY()) {
						throw new Error(
							'Please enter ' + displayName + ' using a flag when piping data.',
						);
					}
					return [4, inquirer_1.default.prompt(questions)];
				case 1:
					(_b = _c.sent()),
						(passphrase = _b.passphrase),
						(passphraseRepeat = _b.passphraseRepeat);
					if (
						!passphrase ||
						(shouldRepeat && passphrase !== passphraseRepeat)
					) {
						throw new error_1.ValidationError(
							getPassphraseVerificationFailError(displayName),
						);
					}
					return [2, passphrase];
			}
		});
	});
};
exports.getPassphraseFromEnvVariable = function(key, displayName) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var passphrase;
		return tslib_1.__generator(this, function(_a) {
			passphrase = process.env[key];
			if (!passphrase) {
				throw new error_1.ValidationError(
					getPassphraseEnvVariableNotSetError(displayName),
				);
			}
			return [2, passphrase];
		});
	});
};
exports.getPassphraseFromFile = function(path) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		return tslib_1.__generator(this, function(_a) {
			return [
				2,
				new Promise(function(resolve, reject) {
					var stream = fs_1.default.createReadStream(path);
					var handleReadError = function(error) {
						stream.close();
						var message = error.message;
						if (message.match(/ENOENT/)) {
							reject(
								new error_1.FileSystemError(getFileDoesNotExistError(path)),
							);
							return;
						}
						if (message.match(/EACCES/)) {
							reject(new error_1.FileSystemError(getFileUnreadableError(path)));
							return;
						}
						reject(error);
						return;
					};
					var handleLine = function(line) {
						stream.close();
						resolve(line);
					};
					stream.on('error', handleReadError);
					readline_1.default
						.createInterface({ input: stream })
						.on('error', handleReadError)
						.on('line', handleLine);
				}),
			];
		});
	});
};
exports.getPassphraseFromSource = function(source, _a) {
	var displayName = _a.displayName;
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var _b, sourceType, sourceIdentifier;
		return tslib_1.__generator(this, function(_c) {
			(_b = exports.splitSource(source)),
				(sourceType = _b.sourceType),
				(sourceIdentifier = _b.sourceIdentifier);
			switch (sourceType) {
				case 'env':
					return [
						2,
						exports.getPassphraseFromEnvVariable(sourceIdentifier, displayName),
					];
				case 'file':
					return [2, exports.getPassphraseFromFile(sourceIdentifier)];
				case 'pass':
					return [2, sourceIdentifier];
				default:
					throw new error_1.ValidationError(
						getPassphraseSourceTypeUnknownError(displayName),
					);
			}
			return [2];
		});
	});
};
exports.getPassphrase = function(passphraseSource, options) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var optionsWithDefaults;
		return tslib_1.__generator(this, function(_a) {
			optionsWithDefaults = tslib_1.__assign(
				{ displayName: 'your secret passphrase' },
				options,
			);
			return [
				2,
				passphraseSource && passphraseSource !== 'prompt'
					? exports.getPassphraseFromSource(
							passphraseSource,
							optionsWithDefaults,
					  )
					: exports.getPassphraseFromPrompt(optionsWithDefaults),
			];
		});
	});
};
exports.handleReadFileErrors = function(path) {
	return function(error) {
		var message = error.message;
		if (message.match(/ENOENT/)) {
			throw new error_1.FileSystemError(getFileDoesNotExistError(path));
		}
		if (message.match(/EACCES/)) {
			throw new error_1.FileSystemError(getFileUnreadableError(path));
		}
		throw error;
	};
};
exports.getDataFromFile = function(path) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		return tslib_1.__generator(this, function(_a) {
			return [2, fs_1.default.readFileSync(path, 'utf8')];
		});
	});
};
exports.getData = function(source) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var _a, sourceType, path;
		return tslib_1.__generator(this, function(_b) {
			if (!source) {
				throw new error_1.ValidationError(ERROR_DATA_MISSING);
			}
			(_a = exports.splitSource(source)),
				(sourceType = _a.sourceType),
				(path = _a.sourceIdentifier);
			if (sourceType !== 'file') {
				throw new error_1.ValidationError(ERROR_DATA_SOURCE);
			}
			return [
				2,
				exports.getDataFromFile(path).catch(exports.handleReadFileErrors(path)),
			];
		});
	});
};
//# sourceMappingURL=utils.js.map
