"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIResource = void 0;
const axios_1 = require("axios");
const errors_1 = require("./errors");
const API_RECONNECT_MAX_RETRY_COUNT = 3;
const REQUEST_RETRY_TIMEOUT = 1000;
class APIResource {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.path = '';
    }
    get headers() {
        return this.apiClient.headers;
    }
    get resourcePath() {
        return `${this.apiClient.currentNode}/api${this.path}`;
    }
    async handleRetry(error, req, retryCount) {
        if (this.apiClient.hasAvailableNodes()) {
            return new Promise(resolve => setTimeout(resolve, REQUEST_RETRY_TIMEOUT)).then(async () => {
                if (retryCount > API_RECONNECT_MAX_RETRY_COUNT) {
                    throw error;
                }
                if (this.apiClient.randomizeNodes) {
                    this.apiClient.banActiveNodeAndSelect();
                }
                return this.request(req, true, retryCount + 1);
            });
        }
        return Promise.reject(error);
    }
    async request(req, retry, retryCount = 1) {
        const request = axios_1.default.request(req)
            .then((res) => res.data)
            .catch((error) => {
            if (error.response) {
                const { status } = error.response;
                if (error.response.data) {
                    const { error: errorString, errors, message, } = error.response.data;
                    throw new errors_1.APIError(message || errorString || 'An unknown error has occurred.', status, errors);
                }
                throw new errors_1.APIError('An unknown error has occurred.', status);
            }
            throw error;
        });
        if (retry) {
            return request.catch(async (err) => this.handleRetry(err, req, retryCount));
        }
        return request;
    }
}
exports.APIResource = APIResource;
//# sourceMappingURL=api_resource.js.map