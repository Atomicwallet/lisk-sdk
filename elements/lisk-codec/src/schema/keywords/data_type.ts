/*
 * Copyright © 2020 Lisk Foundation
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
 */

import * as Debug from 'debug';
import { SchemaError } from '../errors';
import { Schema } from '../../types';

// eslint-disable-next-line new-cap
const debug = Debug('codec:keyword:dataType');

export const metaSchema = {
	title: 'Lisk Codec Data Type',
	type: 'string',
	enum: ['bytes', 'uint32', 'sint32', 'uint64', 'sint64', 'string', 'boolean'],
};

type ValidateFunction = (
	data: string,
	dataPath?: string,
	parentData?: object,
	parentDataProperty?: string | number,
	rootData?: object,
) => boolean;

interface AjvContext {
	root: {
		schema: Schema;
	};
	schemaPath: string;
}
const compile = (
	value: string,
	parentSchema: object,
	it: Partial<AjvContext>,
): ValidateFunction => {
	debug('compile: value: %s', value);
	debug('compile: parent schema: %j', parentSchema);
	const typePropertyPresent = Object.keys(parentSchema).includes('type');

	if (typePropertyPresent) {
		throw new SchemaError({
			keyword: 'dataType',
			message: 'Either "dataType" or "type" can be presented in schema',
			params: { dataType: value },
			dataPath: '',
			schemaPath: it.schemaPath ?? '',
		});
	}

	return (
		_data: string,
		_dataPath?: string,
		_parentData?: object,
		_parentDataProperty?: string | number,
		_rootData?: object,
	): boolean =>
		// Either "dataType" or "type" can be presented in schema
		!typePropertyPresent;
};

export const dataTypeKeyword = {
	compile,
	valid: true,
	errors: true,
	modifying: false,
	metaSchema,
};
