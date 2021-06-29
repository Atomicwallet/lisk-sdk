import { APIClient } from './api_client';
import { Channel } from './types';
export declare const createClient: (channel: Omit<Channel, 'connect' | 'disconnect'>) => Promise<APIClient>;
export declare const createIPCClient: (dataPath: string) => Promise<APIClient>;
export declare const createWSClient: (url: string) => Promise<APIClient>;
