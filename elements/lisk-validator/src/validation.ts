/*
 * Copyright © 2019 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import { hexToBuffer } from '@liskhq/lisk-cryptography';
import {
	gte as isVersionGte,
	gtr as isGreaterThanVersionInRange,
	ltr as isLessThanVersionInRange,
	valid as isValidVersion,
	validRange as isValidRangeVersion,
} from 'semver';
import validator from 'validator';

import {
	MAX_EIGHT_BYTE_NUMBER,
	MAX_INT32,
	MAX_INT64,
	MAX_PUBLIC_KEY_LENGTH,
	MAX_UINT32,
	MAX_UINT64,
	MIN_INT32,
	MIN_INT64,
} from './constants';

export const isNullCharacterIncluded = (input: string): boolean =>
	new RegExp(/\0|\\u0000|\\x00/).test(input);

export const isSignature = (signature: string): boolean =>
	/^[a-f0-9]{128}$/i.test(signature);

export const isGreaterThanMaxTransactionId = (id: bigint): boolean =>
	id > BigInt(MAX_EIGHT_BYTE_NUMBER);

export const isNumberString = (num: unknown): boolean => {
	if (typeof num !== 'string') {
		return false;
	}

	return validator.isInt(num);
};

export const isPositiveNumberString = (num: unknown): boolean => {
	if (typeof num !== 'string') {
		return false;
	}

	return /^[0-9]+$/g.test(num);
};

export const isValidInteger = (num: unknown): boolean =>
	typeof num === 'number' ? Math.floor(num) === num : false;

export const hasNoDuplicate = (values: ReadonlyArray<string>): boolean => {
	const unique = [...new Set(values)];

	return unique.length === values.length;
};

export const isStringBufferLessThan = (data: unknown, max: number): boolean => {
	if (typeof data !== 'string') {
		return false;
	}

	return Buffer.from(data).length <= max;
};

export const isHexString = (data: unknown): boolean => {
	if (typeof data !== 'string') {
		return false;
	}

	return data === '' || /^[a-f0-9]+$/i.test(data);
};

export const isBase64String = (data: unknown): boolean => {
	if (typeof data !== 'string') {
		return false;
	}

	return /^[a-zA-Z0-9+/]+={0,3}$/i.test(data);
};

export const isEncryptedPassphrase = (data: string): boolean => {
	// Explanation of regex structure:
	// - 1 or more 'key=value' pairs delimited with '&'
	// Examples:
	// - cipherText=abcd1234
	// - cipherText=abcd1234&iterations=10000&iv=ef012345
	// NOTE: Maximum lengths chosen here are arbitrary
	const keyRegExp = /[a-zA-Z0-9]{2,15}/;
	const valueRegExp = /[a-f0-9]{1,256}/;
	const keyValueRegExp = new RegExp(
		`${keyRegExp.source}=${valueRegExp.source}`,
	);
	const encryptedPassphraseRegExp = new RegExp(
		`^(${keyValueRegExp.source})(?:&(${keyValueRegExp.source})){0,10}$`,
	);

	return encryptedPassphraseRegExp.test(data);
};

export const isSemVer = (version: string): boolean => !!isValidVersion(version);

export const isRangedSemVer = (version: string): boolean =>
	!!isValidRangeVersion(version);

export const isLessThanRangedVersion = isLessThanVersionInRange;
export const isGreaterThanRangedVersion = isGreaterThanVersionInRange;

export const isProtocolString = (data: string): boolean =>
	/^(\d|[1-9]\d{1,2})\.(\d|[1-9]\d{1,2})$/.test(data);

const IPV4_NUMBER = '4';
const IPV6_NUMBER = '6';

export const isIPV4 = (data: string): boolean =>
	validator.isIP(data, IPV4_NUMBER);

export const isIPV6 = (data: string): boolean =>
	validator.isIP(data, IPV6_NUMBER);

export const isIP = (data: string): boolean => isIPV4(data) || isIPV6(data);

export const isPort = (port: string): boolean => validator.isPort(port);

export const validatePublicKeysForDuplicates = (
	publicKeys: ReadonlyArray<string>,
): boolean =>
	publicKeys.every((element, index) => {
		if (publicKeys.slice(index + 1).includes(element)) {
			throw new Error(`Duplicated public key: ${publicKeys[index]}.`);
		}

		return true;
	});

export const isStringEndsWith = (
	target: string,
	suffixes: ReadonlyArray<string>,
): boolean => suffixes.some(suffix => target.endsWith(suffix));

export const isVersionMatch = isVersionGte;

export const validatePublicKey = (publicKey: string): boolean => {
	const publicKeyBuffer = hexToBuffer(publicKey);
	if (publicKeyBuffer.length !== MAX_PUBLIC_KEY_LENGTH) {
		throw new Error(
			`Public key ${publicKey} length differs from the expected 32 bytes for a public key.`,
		);
	}

	return true;
};

export const validatePublicKeys = (
	publicKeys: ReadonlyArray<string>,
): boolean =>
	publicKeys.every(validatePublicKey) &&
	validatePublicKeysForDuplicates(publicKeys);

const ADDRESS_LENGTH = 40;

export const validateAddress = (address: string): boolean => {
	if (address.length !== ADDRESS_LENGTH) {
		throw new Error(
			'Address length does not match requirements. Expected 40 characters.',
		);
	}

	if (!isHexString(address)) {
		throw new Error('Address is not a valid hex string.');
	}

	return true;
};

export const isValidNonTransferAmount = (data: string): boolean =>
	isNumberString(data) && data === '0';

export const isCsv = (data: string): boolean => {
	if (typeof data !== 'string') {
		return false;
	}

	const csvAsArray = data.split(',');

	if (csvAsArray.length > 0) {
		return true;
	}

	return false;
};

const MAX_TRANSFER_ASSET_DATA_LENGTH = 64;

export const isValidTransferData = (data: string): boolean =>
	Buffer.byteLength(data, 'utf8') <= MAX_TRANSFER_ASSET_DATA_LENGTH;

const NETWORK_IDENTIFIER_LENGTH = 32;
export const validateNetworkIdentifier = (
	networkIdentifier: string,
): boolean => {
	if (!networkIdentifier) {
		throw new Error(`Network identifier can not be empty.`);
	}
	const networkIdentifierBuffer = hexToBuffer(networkIdentifier);
	if (networkIdentifierBuffer.length !== NETWORK_IDENTIFIER_LENGTH) {
		throw new Error(`Invalid network identifier length: ${networkIdentifier}`);
	}

	return true;
};

export const isString = (data: unknown): boolean => typeof data === 'string';

export const isBoolean = (data: unknown): boolean => typeof data === 'boolean';

export const isInt32 = (data: unknown): boolean => {
	if (typeof data === 'number' && Number.isInteger(data)) {
		return data <= MAX_INT32 && data >= MIN_INT32;
	}

	return false;
};

export const isUint32 = (data: unknown): boolean => {
	if (typeof data === 'number' && Number.isInteger(data)) {
		return data <= MAX_UINT32 && data >= 0;
	}

	return false;
};

export const isInt64 = (data: unknown): boolean =>
	typeof data === 'bigint' ? data <= MAX_INT64 && data >= MIN_INT64 : false;

export const isUint64 = (data: unknown): boolean =>
	typeof data === 'bigint' ? data <= MAX_UINT64 && data >= BigInt(0) : false;

export const isBytes = (data: Buffer): boolean => Buffer.isBuffer(data);
