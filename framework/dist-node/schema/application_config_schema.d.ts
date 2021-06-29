export declare const applicationConfigSchema: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        label: {
            type: string;
            pattern: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        version: {
            type: string;
            format: string;
        };
        networkVersion: {
            type: string;
            format: string;
        };
        rootPath: {
            type: string;
            format: string;
            minLength: number;
            maxLength: number;
            examples: string[];
            description: string;
        };
        logger: {
            type: string;
            required: string[];
            properties: {
                fileLogLevel: {
                    type: string;
                    enum: string[];
                };
                logFileName: {
                    type: string;
                };
                consoleLogLevel: {
                    type: string;
                    enum: string[];
                };
            };
        };
        genesisConfig: {
            $id: string;
            type: string;
            required: string[];
            properties: {
                blockTime: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                communityIdentifier: {
                    type: string;
                    description: string;
                };
                bftThreshold: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                minFeePerByte: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                baseFees: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        properties: {
                            moduleID: {
                                type: string;
                                minimum: number;
                            };
                            assetID: {
                                type: string;
                                minimum: number;
                            };
                            baseFee: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                };
                maxPayloadLength: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                rewards: {
                    $id: string;
                    type: string;
                    required: string[];
                    description: string;
                    properties: {
                        milestones: {
                            type: string;
                            items: {
                                type: string;
                                format: string;
                            };
                            description: string;
                        };
                        offset: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        distance: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                    };
                    additionalProperties: boolean;
                };
            };
            additionalProperties: boolean;
        };
        forging: {
            type: string;
            required: string[];
            properties: {
                force: {
                    type: string;
                };
                waitThreshold: {
                    description: string;
                    type: string;
                };
                defaultPassword: {
                    type: string;
                };
                delegates: {
                    type: string;
                    items: {
                        required: string[];
                        properties: {
                            encryptedPassphrase: {
                                type: string;
                                format: string;
                            };
                            address: {
                                type: string;
                                format: string;
                            };
                            hashOnion: {
                                type: string;
                                required: string[];
                                properties: {
                                    count: {
                                        minimum: number;
                                        type: string;
                                    };
                                    distance: {
                                        minimum: number;
                                        type: string;
                                    };
                                    hashes: {
                                        type: string;
                                        minItems: number;
                                        items: {
                                            type: string;
                                            format: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        network: {
            type: string;
            properties: {
                port: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                hostIp: {
                    type: string;
                    format: string;
                };
                seedPeers: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            ip: {
                                type: string;
                                format: string;
                            };
                            port: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                };
                blacklistedIPs: {
                    type: string;
                    items: {
                        type: string;
                        format: string;
                    };
                };
                fixedPeers: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            ip: {
                                type: string;
                                format: string;
                            };
                            port: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    maximum: number;
                };
                whitelistedPeers: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            ip: {
                                type: string;
                                format: string;
                            };
                            port: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                };
                peerBanTime: {
                    type: string;
                };
                connectTimeout: {
                    type: string;
                };
                ackTimeout: {
                    type: string;
                };
                maxOutboundConnections: {
                    type: string;
                };
                maxInboundConnections: {
                    type: string;
                };
                sendPeerLimit: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                maxPeerDiscoveryResponseLength: {
                    type: string;
                    maximum: number;
                };
                maxPeerInfoSize: {
                    type: string;
                    maximum: number;
                };
                wsMaxPayload: {
                    type: string;
                    maximum: number;
                };
                advertiseAddress: {
                    type: string;
                };
            };
            required: string[];
        };
        plugins: {
            type: string;
        };
        transactionPool: {
            type: string;
            properties: {
                maxTransactions: {
                    type: string;
                    minimum: number;
                };
                maxTransactionsPerAccount: {
                    type: string;
                    minimum: number;
                };
                transactionExpiryTime: {
                    type: string;
                    minimum: number;
                };
                minEntranceFeePriority: {
                    type: string;
                    format: string;
                };
                minReplacementFeeDifference: {
                    type: string;
                    format: string;
                };
            };
        };
        rpc: {
            type: string;
            properties: {
                enable: {
                    type: string;
                };
                mode: {
                    type: string;
                    enum: string[];
                };
                port: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                host: {
                    type: string;
                    format: string;
                };
            };
        };
    };
    additionalProperties: boolean;
    default: {
        label: string;
        version: string;
        networkVersion: string;
        rootPath: string;
        logger: {
            fileLogLevel: string;
            consoleLogLevel: string;
            logFileName: string;
        };
        rpc: {
            enable: boolean;
            mode: string;
            port: number;
            host: string;
        };
        genesisConfig: {
            blockTime: number;
            communityIdentifier: string;
            maxPayloadLength: number;
            bftThreshold: number;
            minFeePerByte: number;
            baseFees: never[];
            rewards: {
                milestones: string[];
                offset: number;
                distance: number;
            };
        };
        forging: {
            force: boolean;
            waitThreshold: number;
            delegates: never[];
        };
        network: {
            seedPeers: never[];
            port: number;
        };
        transactionPool: {
            maxTransactions: number;
            maxTransactionsPerAccount: number;
            transactionExpiryTime: number;
            minEntranceFeePriority: string;
            minReplacementFeeDifference: string;
        };
        plugins: {};
    };
};
