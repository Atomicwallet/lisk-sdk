/// <reference path="../../../external_types/pm2-axon/index.d.ts" />
/// <reference path="../../../external_types/pm2-axon-rpc/index.d.ts" />
import { IPCSocket } from './ipc_socket';
export declare class IPCServer extends IPCSocket {
    constructor(options: {
        socketsDir: string;
        name: string;
    });
    start(): Promise<void>;
}
