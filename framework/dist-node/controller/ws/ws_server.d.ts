import * as WebSocket from 'ws';
import { Logger } from '../../logger';
interface WebSocketWithTracking extends WebSocket {
    isAlive?: boolean;
}
export declare type WSMessageHandler = (socket: WebSocketWithTracking, message: string) => void;
export declare class WSServer {
    server: WebSocket.Server;
    private pingTimer;
    private readonly port;
    private readonly host?;
    private readonly path;
    private readonly logger;
    constructor(options: {
        port: number;
        host?: string;
        path: string;
        logger: Logger;
    });
    start(messageHandler: WSMessageHandler): WebSocket.Server;
    stop(): void;
    broadcast(message: string): void;
    private _handleConnection;
    private _handleHeartbeat;
    private _setUpPing;
}
export {};
