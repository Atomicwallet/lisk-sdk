import { TokenAccount } from './types';
import { BaseModule } from '../base_module';
import { AfterBlockApplyContext, AfterGenesisBlockApplyContext, StateStore, TransactionApplyContext, GenesisConfig } from '../../types';
export declare class TokenModule extends BaseModule {
    name: string;
    id: number;
    accountSchema: {
        type: string;
        properties: {
            balance: {
                fieldNumber: number;
                dataType: string;
            };
        };
        default: {
            balance: bigint;
        };
    };
    reducers: {
        credit: (params: Record<string, unknown>, stateStore: StateStore) => Promise<void>;
        debit: (params: Record<string, unknown>, stateStore: StateStore) => Promise<void>;
        getBalance: (params: Record<string, unknown>, stateStore: StateStore) => Promise<bigint>;
        getMinRemainingBalance: () => Promise<bigint>;
    };
    private readonly _minRemainingBalance;
    constructor(genesisConfig: GenesisConfig);
    beforeTransactionApply({ transaction, stateStore, }: TransactionApplyContext): Promise<void>;
    afterTransactionApply({ transaction, stateStore, }: TransactionApplyContext): Promise<void>;
    afterBlockApply({ block, stateStore }: AfterBlockApplyContext): Promise<void>;
    afterGenesisBlockApply({ genesisBlock, }: AfterGenesisBlockApplyContext<TokenAccount>): Promise<void>;
}
