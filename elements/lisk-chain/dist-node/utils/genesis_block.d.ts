import { GenesisBlock, AccountSchema, AccountDefaultProps } from '../types';
export declare const readGenesisBlockJSON: <T = AccountDefaultProps>(genesisBlockJSON: Record<string, unknown>, accountSchemas: {
    [name: string]: AccountSchema;
}) => GenesisBlock<T>;
