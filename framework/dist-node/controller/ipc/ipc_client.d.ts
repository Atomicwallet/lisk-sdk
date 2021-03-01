/// <reference path="../../../external_types/pm2-axon/index.d.ts" />
/// <reference path="../../../external_types/pm2-axon-rpc/index.d.ts" />
import { Client as RPCClient } from 'pm2-axon-rpc';
import { IPCSocket } from './ipc_socket';
export declare class IPCClient extends IPCSocket {
    rpcClient: RPCClient;
    protected readonly _actionRPCConnectingServerSocketPath: string;
    constructor(options: {
        socketsDir: string;
        name: string;
        rpcServerSocketPath: string;
    });
    start(): Promise<void>;
    stop(): void;
}
