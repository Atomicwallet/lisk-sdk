import { P2PPeerInfo, P2PPeerSelectionForConnectionInput, P2PPeerSelectionForRequestInput, P2PPeerSelectionForSendInput } from '../types';
export declare const selectPeersForRequest: (input: P2PPeerSelectionForRequestInput) => ReadonlyArray<P2PPeerInfo>;
export declare const selectPeersForSend: (input: P2PPeerSelectionForSendInput) => ReadonlyArray<P2PPeerInfo>;
export declare const selectPeersForConnection: (input: P2PPeerSelectionForConnectionInput) => ReadonlyArray<P2PPeerInfo>;
