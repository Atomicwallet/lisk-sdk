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
import { APIClient } from '../src/api_client';
import { APIResource } from '../src/api_resource';
import { AxiosRequestConfig } from 'axios';
// Required for stub
const axios = require('axios');

describe('API resource module', () => {
	const GET = 'GET';
	const defaultBasePath = 'http://localhost:1234';
	const defaultResourcePath = '/resources';
	const defaultFullPath = `${defaultBasePath}/api${defaultResourcePath}`;
	const defaultHeaders = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		nethash: 'mainnetHash',
		os: 'lisk-elements-api',
		version: '1.0.0',
		minVersion: '>=0.5.0',
		port: '443',
	};
	const defaultRequest = {
		method: GET,
		url: defaultFullPath,
		headers: defaultHeaders,
	};

	const sendRequestResult = {
		data: [],
		body: {},
		limit: 0,
	};

	interface FakeAPIClient {
		headers: object;
		currentNode: string;
		hasAvailableNodes: () => boolean | void;
		randomizeNodes: boolean;
		banActiveNodeAndSelect: () => void;
	}

	let resource: APIResource;
	let apiClient: FakeAPIClient;

	beforeEach(() => {
		apiClient = {
			headers: { ...defaultHeaders },
			currentNode: defaultBasePath,
			hasAvailableNodes: () => true,
			randomizeNodes: false,
			banActiveNodeAndSelect: jest.fn(),
		};
		resource = new APIResource(apiClient as APIClient);
		return Promise.resolve();
	});

	describe('#constructor', () => {
		it('should create an API resource instance', () => {
			return expect(resource).toBeInstanceOf(APIResource);
		});
	});

	describe('get headers', () => {
		it('should return header set to apiClient', () => {
			return expect(resource.headers).toEqual(defaultHeaders);
		});
	});

	describe('get resourcePath', () => {
		it('should return the resource’s full path', () => {
			return expect(resource.resourcePath).toBe(`${defaultBasePath}/api`);
		});

		it('should return the resource’s full path with set path', () => {
			resource.path = defaultResourcePath;
			return expect(resource.resourcePath).toBe(
				`${defaultBasePath}/api${defaultResourcePath}`,
			);
		});
	});

	describe('#request', () => {
		let requestStub: jest.SpyInstance;
		let handleRetryStub: jest.SpyInstance;

		beforeEach(() => {
			requestStub = jest.spyOn(axios, 'request').mockResolvedValue({
				status: 200,
				data: sendRequestResult,
			} as any);
			handleRetryStub = jest.spyOn(resource, 'handleRetry');
			return Promise.resolve();
		});

		it('should make a request to API without calling retry', () => {
			return resource
				.request(defaultRequest as AxiosRequestConfig, false)
				.then(res => {
					expect(requestStub).toHaveBeenCalledTimes(1);
					expect(requestStub).toHaveBeenCalledWith(defaultRequest);
					expect(handleRetryStub).not.toHaveBeenCalled();
					return expect(res).toEqual(sendRequestResult);
				});
		});

		it('should make a request to API without calling retry when it succeeds', () => {
			return resource
				.request(defaultRequest as AxiosRequestConfig, true)
				.then(res => {
					expect(requestStub).toHaveBeenCalledTimes(1);
					expect(requestStub).toHaveBeenCalledWith(defaultRequest);
					expect(handleRetryStub).not.toHaveBeenCalled();
					return expect(res).toEqual(sendRequestResult);
				});
		});

		describe('when response status is greater than 300', () => {
			it('should reject with errno if status code is supplied', () => {
				const statusCode = 300;
				requestStub.mockRejectedValue({
					response: {
						status: statusCode,
						data: undefined,
					},
				});

				return resource
					.request(defaultRequest as AxiosRequestConfig, false)
					.catch(err => {
						return expect(err.errno).toBe(statusCode);
					});
			});

			it('should reject with "An unknown error has occured." message if there is no data is supplied', () => {
				const statusCode = 300;
				requestStub.mockRejectedValue({
					response: {
						status: statusCode,
						data: undefined,
					},
				});

				return resource
					.request(defaultRequest as AxiosRequestConfig, false)
					.catch(err => {
						return expect(err.message).toBe('An unknown error has occurred.');
					});
			});

			it('should reject with "An unknown error has occured." message if there is no message is supplied', () => {
				const statusCode = 300;
				requestStub.mockRejectedValue({
					response: {
						status: statusCode,
						data: sendRequestResult,
					},
				});

				return resource
					.request(defaultRequest as AxiosRequestConfig, false)
					.catch(err => {
						return expect(err.message).toBe('An unknown error has occurred.');
					});
			});

			it('should reject with error message from server if message is supplied', () => {
				const serverErrorMessage = 'validation error';
				const statusCode = 300;
				requestStub.mockRejectedValue({
					response: {
						status: statusCode,
						data: { message: serverErrorMessage },
					},
				});

				return resource
					.request(defaultRequest as AxiosRequestConfig, false)
					.catch(err => {
						return expect(err.message).toEqual(serverErrorMessage);
					});
			});

			it('should reject with error message from server if message is undefined and error is supplied', () => {
				const serverErrorMessage = 'error from server';
				const statusCode = 300;
				requestStub.mockRejectedValue({
					response: {
						status: statusCode,
						data: { message: undefined, error: serverErrorMessage },
					},
				});

				return resource
					.request(defaultRequest as AxiosRequestConfig, false)
					.catch(err => {
						return expect(err.message).toEqual(serverErrorMessage);
					});
			});

			it('should reject with errors from server if errors are supplied', () => {
				const serverErrorMessage = 'validation error';
				const statusCode = 300;
				const errors = [
					{
						code: 'error_code_1',
						message: 'message1',
					},
					{
						code: 'error_code_2',
						message: 'message2',
					},
				];
				requestStub.mockRejectedValue({
					response: {
						status: statusCode,
						data: { message: serverErrorMessage, errors },
					},
				});

				return resource
					.request(defaultRequest as AxiosRequestConfig, false)
					.catch(err => {
						return expect(err.errors).toEqual(errors);
					});
			});

			it('should reject with error if client rejects with plain error', () => {
				const clientError = new Error('client error');
				requestStub.mockRejectedValue(clientError);
				return resource
					.request(defaultRequest as AxiosRequestConfig, false)
					.catch(err => {
						return expect(err).toEqual(clientError);
					});
			});

			it('should make a request to API with calling retry', () => {
				const statusCode = 300;
				requestStub.mockRejectedValue({
					response: {
						status: statusCode,
						data: sendRequestResult,
					},
				});
				return resource
					.request(defaultRequest as AxiosRequestConfig, true)
					.catch(() => {
						expect(requestStub).toHaveBeenCalled();
						return expect(handleRetryStub).toHaveBeenCalled();
					});
			});
		});
	});

	describe('#handleRetry', () => {
		let requestStub: jest.SpyInstance;
		let defaultError: Error;
		beforeEach(() => {
			defaultError = new Error('could not connect to a node');
			requestStub = jest
				.spyOn(resource, 'request')
				.mockResolvedValue(sendRequestResult.body as any);
			return Promise.resolve();
		});

		describe('when there is available node', () => {
			beforeEach(() => {
				jest.useFakeTimers();
				apiClient.hasAvailableNodes = () => true;
				return Promise.resolve();
			});

			it('should call banActiveNode when randomizeNodes is true', () => {
				apiClient.randomizeNodes = true;
				const req = resource.handleRetry(
					defaultError,
					defaultRequest as AxiosRequestConfig,
					1,
				);
				jest.advanceTimersByTime(1000);
				return req.then(res => {
					expect(apiClient.banActiveNodeAndSelect).toHaveBeenCalledTimes(1);
					expect(requestStub).toHaveBeenCalledWith(
						defaultRequest,
						true,
						expect.anything(),
					);
					return expect(res).toEqual(sendRequestResult.body);
				});
			});

			it('should not call ban active node when randomizeNodes is false', () => {
				apiClient.randomizeNodes = false;
				const req = resource.handleRetry(
					defaultError,
					defaultRequest as AxiosRequestConfig,
					1,
				);
				jest.advanceTimersByTime(1000);
				return req.then(res => {
					expect(apiClient.banActiveNodeAndSelect).not.toHaveBeenCalled();
					expect(requestStub).toHaveBeenCalledWith(
						defaultRequest,
						true,
						expect.anything(),
					);
					return expect(res).toEqual(sendRequestResult.body);
				});
			});

			it('should throw an error when randomizeNodes is false and the maximum retry count has been reached', () => {
				apiClient.randomizeNodes = false;
				const req = resource.handleRetry(
					defaultError,
					defaultRequest as AxiosRequestConfig,
					4,
				);
				jest.advanceTimersByTime(1000);
				return expect(req).rejects.toEqual(defaultError);
			});
		});

		describe('when there is no available node', () => {
			beforeEach(() => {
				apiClient.hasAvailableNodes = () => false;
				return Promise.resolve();
			});

			it('should throw an error that is the same as input error', () => {
				const res = resource.handleRetry(
					defaultError,
					defaultRequest as AxiosRequestConfig,
					1,
				);
				return expect(res).rejects.toEqual(defaultError);
			});
		});
	});
});
