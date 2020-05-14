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

import { findObjectByPath, generateKey } from './utils';
import {
	CompiledSchema,
	CompiledSchemas,
	GenericObject,
	Schema,
	SchemaPair,
} from './types';

import { writeVarInt, writeSignedVarInt } from './varint';
import { writeString } from './string';
import { writeBytes } from './bytes';
import { writeBoolean } from './boolean';


export class Codec {
	private readonly _compileSchemas: CompiledSchemas = {};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private readonly _writers : { readonly [key: string]: (value: any, _schema: any) => Buffer }= {
		int32: writeVarInt,
		sint32: writeSignedVarInt,
		int64: writeVarInt,
		sint64: writeSignedVarInt,
		string: writeString,
		bytes: writeBytes,
		boolean: writeBoolean,
	};

	public addSchema(schema: Schema): void {
		const schemaName = schema.$id;
		this._compileSchemas[schemaName] = this.compileSchema(
			schema.properties,
			[],
			[],
		);
	}

	public encode(schema: Schema, message: GenericObject): Buffer {
		if (this._compileSchemas[schema.$id] === undefined) {
			this.addSchema(schema);
		}

		const compiledSchema = this._compileSchemas[schema.$id];

		let binaryMessage = Buffer.alloc(0);
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < compiledSchema.length; i += 1) {
			const { binaryKey, dataPath, schemaProp, propertyName } = compiledSchema[i];
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const pathToValue = findObjectByPath(message, dataPath);
			if (pathToValue === undefined) {
				throw new Error(
					'Compiled schema contains an invalid path to a property. Some problem occured when caching the schema.',
				);
			}

			const value = pathToValue[propertyName];

			const dataType = schemaProp.dataType ?? schemaProp.type;

			if (dataType === undefined) {
				throw new Error('Schema is corrutped as neither "type" nor "dataType" are defined in it.');
			}

			const binaryValue = this._writers[dataType](value, schemaProp);

			binaryMessage = Buffer.concat([binaryMessage, Buffer.from([binaryKey]), binaryValue]);
		}

		return binaryMessage;
	}

	// eslint-disable-next-line
	public decode<T>(_schema: object, _message: Buffer): T {
		return {} as T;
	}

	private compileSchema(
		schema: SchemaPair,
		compiledSchema: CompiledSchema[],
		dataPath: string[],
	): CompiledSchema[] {
		const currentDepthSchema = Object.entries(schema).sort(
			(a, b) => a[1].fieldNumber - b[1].fieldNumber,
		);

		for (const [propertyName, schemaProp] of currentDepthSchema) {
			if (schemaProp.dataType === 'object') {
				dataPath.push(propertyName);
				if (!schemaProp.properties) {
					throw new Error('Sub schema is missing its properties.');
				}
				this.compileSchema(schemaProp.properties, compiledSchema, dataPath);
				dataPath.pop();
			} else {
				compiledSchema.push({
					schemaProp,
					propertyName,
					binaryKey: generateKey(schemaProp),
					dataPath: [...dataPath],
				});
			}
		}

		return compiledSchema;
	}
}

export const codec = new Codec();
