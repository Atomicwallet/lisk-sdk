/// <reference types="node" />
import { Validator } from '../types';
interface MinimalStateStore {
    consensus: {
        get: (key: string) => Promise<Buffer | undefined>;
    };
}
export declare const getValidators: (stateStore: MinimalStateStore) => Promise<Validator[]>;
export {};
