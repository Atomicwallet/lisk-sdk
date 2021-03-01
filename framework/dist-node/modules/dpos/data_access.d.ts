import { StateStore } from '../../types';
import { DelegatePersistedUsernames, VoteWeights } from './types';
export declare const getRegisteredDelegates: (store: StateStore) => Promise<DelegatePersistedUsernames>;
export declare const setRegisteredDelegates: (store: StateStore, usernames: DelegatePersistedUsernames) => Promise<void>;
export declare const getVoteWeights: (stateStore: StateStore) => Promise<VoteWeights>;
export declare const setVoteWeights: (stateStore: StateStore, voteWeights: VoteWeights) => Promise<void>;
export declare const deleteVoteWeightsUntilRound: (round: number, stateStore: StateStore) => Promise<void>;
