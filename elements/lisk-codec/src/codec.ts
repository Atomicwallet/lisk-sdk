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

import {
	generateKey,
} from './utils';

import {
	CompiledSchemas,
	CompiledSchemasArray,
	GenericObject,
	Schema,
	SchemaProps,
} from './types';

import { writeObject } from './collection';

// import { writeSInt32, writeSInt64, writeUInt32, writeUInt64 } from './varint';
// import { writeString } from './string';
// import { writeBytes } from './bytes';
// import { writeBoolean } from './boolean';


export class Codec {
	private readonly _compileSchemas: CompiledSchemas = {};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// private readonly _writers : { readonly [key: string]: (value: any) => Buffer } = {
	// 	uint32: writeUInt32,
	// 	sint32: writeSInt32,
	// 	uint64: writeUInt64,
	// 	sint64: writeSInt64,
	// 	string: writeString,
	// 	bytes: writeBytes,
	// 	boolean: writeBoolean,
	// };

	public addSchema(schema: Schema): void {
		const schemaName = schema.$id;
		this._compileSchemas[schemaName] = this.compileSchema(
			schema,
			[],
			[],
		);
	}

	public encode(schema: Schema, message: GenericObject): Buffer {
		if (this._compileSchemas[schema.$id] === undefined) {
			this.addSchema(schema);
		}

		const compiledSchema = this._compileSchemas[schema.$id];

		// const binaryMessage = { chunks: [], writenSize: 0 };

		const res = writeObject(compiledSchema, message, []);

		console.log('+'.repeat(120));
		console.log(res);
		console.log(Buffer.concat(res[0]).toString('hex'));
		console.log('FINAL BUFFER STRING CONTENT............');
		res[0].forEach((aBuffValue, idx) => console.log(idx, aBuffValue.toString()));
		return Buffer.concat(res[0]); // HERE MAYBE RETURN BUFFER + SIZE SO WE CAN ADD TO THE KEY OF NESTED OBJECTS?
	}



	// eslint-disable-next-line
	public decode<T>(_schema: object, _message: Buffer): T {
		return {} as T;
	}

	private compileSchema(
		schema: Schema | SchemaProps,
		compiledSchema: CompiledSchemasArray,
		dataPath: string[],
	): CompiledSchemasArray {
		if (schema.type === 'object') {
			const { properties } = schema;
			if (properties === undefined) {
				throw new Error('Invalid schema. Missing "properties" property');
			}
			const currentDepthSchema = Object.entries(properties).sort(
				(a, b) => a[1].fieldNumber - b[1].fieldNumber,
			);

			// eslint-disable-next-line @typescript-eslint/prefer-for-of
			for (let i = 0; i < currentDepthSchema.length; i += 1) {
				const [schemaPropertyName, schemaPropertyValue] = currentDepthSchema[i];
				if (schemaPropertyValue.type === 'object') { // Object recursive case
					dataPath.push(schemaPropertyName);
					const nestedSchema = [
						{
							propertyName: schemaPropertyName,
							schemaProp: { type: schemaPropertyValue.type, fieldNumber: schemaPropertyValue.fieldNumber },
              dataPath: [...dataPath],
              binaryKey: generateKey(schemaPropertyValue),
						},
					];
					const res = this.compileSchema(schemaPropertyValue, nestedSchema, dataPath);
					compiledSchema.push(res as any);
					dataPath.pop();
				} else if (schemaPropertyValue.type === 'array') { // Array recursive case
					if (schemaPropertyValue.items === undefined) {
						throw new Error('Invalid schema. Missing "items" property for Array schema');
					}
					dataPath.push(schemaPropertyName);
					if (schemaPropertyValue.items.type === 'object') {
						const nestedSchema = [
							{
								propertyName: schemaPropertyName,
								schemaProp: { type: 'object', fieldNumber: schemaPropertyValue.fieldNumber },
								dataPath: [...dataPath],
								binaryKey: generateKey(schemaPropertyValue),
							},
						]
						const res = this.compileSchema(schemaPropertyValue.items, nestedSchema, dataPath);
						compiledSchema.push([
							{
								propertyName: schemaPropertyName,
								schemaProp: { type: schemaPropertyValue.type, fieldNumber: schemaPropertyValue.fieldNumber },
								dataPath: [...dataPath],
								binaryKey: generateKey(schemaPropertyValue),
							},
							res as any,
						]);
						dataPath.pop();
					} else {
						compiledSchema.push([
							{
								propertyName: schemaPropertyName,
								schemaProp: { type: schemaPropertyValue.type, fieldNumber: schemaPropertyValue.fieldNumber },
								dataPath: [...dataPath],
								binaryKey: generateKey(schemaPropertyValue),
							},
							{
								propertyName: schemaPropertyName,
								schemaProp: { dataType: schemaPropertyValue.items.dataType, fieldNumber: schemaPropertyValue.fieldNumber },
								dataPath: [...dataPath],
								binaryKey: generateKey(schemaPropertyValue),
							},
						]);
						dataPath.pop();
					}
				} else { // Base case
					compiledSchema.push({
						propertyName: schemaPropertyName,
						schemaProp: schemaPropertyValue,
						dataPath: [...dataPath],
						binaryKey: generateKey(schemaPropertyValue),
				 });
				}
			}
		}
		return compiledSchema
	}
}

export const codec = new Codec();
