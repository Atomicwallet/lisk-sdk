/// <reference types="node" />
import { Schema } from '@liskhq/lisk-codec';
import { P2PPeerInfo, P2PNodeInfo, ProtocolPeerInfo } from '../types';
export declare const decodePeerInfo: (peerInfoSchema: Schema, data?: unknown) => P2PPeerInfo;
export declare const decodeNodeInfo: (nodeInfoSchema: Schema, data?: unknown) => P2PNodeInfo;
export declare const encodePeerInfo: (peerInfoSchema: Schema, data: ProtocolPeerInfo) => Buffer;
export declare const encodeNodeInfo: (nodeInfoSchema: Schema, data: P2PNodeInfo) => Buffer;
