/// <reference types="node" />
import { P2PCompatibilityCheckReturnType, P2PMessagePacket, P2PNodeInfo, P2PPeerInfo, P2PRequestPacket } from '../types';
export declare const validatePeerCompatibility: (peerInfo: P2PPeerInfo, nodeInfo: P2PNodeInfo) => P2PCompatibilityCheckReturnType;
export declare const validatePeerAddress: (ipAddress: string, port: number) => boolean;
export declare const validatePeerInfo: (peerInfo: P2PPeerInfo | undefined, maxByteSize: number) => P2PPeerInfo;
export declare const validateNodeInfo: (nodeInfo: Buffer, maxByteSize: number) => void;
export declare const validatePeerInfoList: (rawBasicPeerInfoList: unknown, maxPeerInfoListLength: number, maxPeerInfoByteSize: number) => readonly P2PPeerInfo[];
export declare const validateRPCRequest: (request: unknown) => P2PRequestPacket;
export declare const validateProtocolMessage: (message: unknown) => P2PMessagePacket;
export declare const validatePacket: (packet: unknown) => void;
export declare const isEmptyMessage: (data: unknown) => boolean;
