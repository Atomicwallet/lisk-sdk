import { P2PPeerInfo, P2PPeerSelectionForConnectionInput, P2PPeerSelectionForRequestInput, P2PPeerSelectionForSendInput } from '../types';
export declare const selectPeersForRequest: (input: P2PPeerSelectionForRequestInput) => readonly P2PPeerInfo[];
export declare const selectPeersForSend: (input: P2PPeerSelectionForSendInput) => readonly P2PPeerInfo[];
export declare const selectPeersForConnection: (input: P2PPeerSelectionForConnectionInput) => readonly P2PPeerInfo[];
