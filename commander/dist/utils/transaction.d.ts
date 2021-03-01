/// <reference types="node" />
import * as liskApiClient from '@liskhq/lisk-api-client';
import { RegisteredSchema } from 'lisk-framework';
import { Schema } from '../types';
export declare const getAssetSchema: (registeredSchema: RegisteredSchema, moduleID: number, assetID: number) => Schema | undefined;
export declare const decodeTransaction: (schema: RegisteredSchema, transactionHexStr: string, apiClient?: liskApiClient.APIClient | undefined) => Record<string, unknown>;
export declare const encodeTransaction: (schema: RegisteredSchema, transaction: Record<string, unknown>, apiClient?: liskApiClient.APIClient | undefined) => Buffer;
export declare const transactionToJSON: (schema: RegisteredSchema, transaction: Record<string, unknown>, apiClient?: liskApiClient.APIClient | undefined) => Record<string, unknown>;
export declare const getApiClient: (appDataPath: string | undefined, name: string) => Promise<liskApiClient.APIClient>;
