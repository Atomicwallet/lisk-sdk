/// <reference path="../../../external_types/pm2-axon/index.d.ts" />
/// <reference path="../../../external_types/pm2-axon-rpc/index.d.ts" />
import { PubSocket, PullSocket, PushSocket, SubSocket } from 'pm2-axon';
import { Server as RPCServer } from 'pm2-axon-rpc';
export declare abstract class IPCSocket {
    pubSocket: PushSocket | PubSocket;
    subSocket: PullSocket | SubSocket;
    rpcServer: RPCServer;
    protected readonly _eventPubSocketPath: string;
    protected readonly _eventSubSocketPath: string;
    protected readonly _actionRpcSeverSocketPath: string;
    protected constructor(options: {
        socketsDir: string;
        name: string;
    });
    get rpcServerSocketPath(): string;
    stop(): void;
    start(): Promise<void>;
}
