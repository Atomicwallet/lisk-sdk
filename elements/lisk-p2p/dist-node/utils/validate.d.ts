/// <reference types="node" />
import { P2PCompatibilityCheckReturnType, P2PNodeInfo, P2PPeerInfo } from '../types';
export declare const validatePeerCompatibility: (peerInfo: P2PPeerInfo, nodeInfo: P2PNodeInfo) => P2PCompatibilityCheckReturnType;
export declare const validatePeerAddress: (ipAddress: string, port: number) => boolean;
export declare const validatePeerInfo: (peerInfo: P2PPeerInfo | undefined, maxByteSize: number) => P2PPeerInfo;
export declare const validatePayloadSize: (nodeInfo: Buffer | undefined, maxByteSize: number) => void;
export declare const validatePeerInfoList: (peersList: ReadonlyArray<P2PPeerInfo>, maxPeerInfoListLength: number, maxPeerInfoByteSize: number) => void;
export declare const validateRPCRequest: (request: unknown) => void;
export declare const validateProtocolMessage: (message: unknown) => void;
export declare const validatePacket: (packet: unknown) => void;
export declare const isEmptyMessage: (data: unknown) => boolean;
