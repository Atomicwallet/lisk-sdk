import { AccountKeys } from './types';
import { BaseModule } from '../base_module';
import { AfterGenesisBlockApplyContext, TransactionApplyContext } from '../../types';
import { RegisterAsset } from './register_asset';
export declare class KeysModule extends BaseModule {
    name: string;
    id: number;
    accountSchema: {
        type: string;
        properties: {
            numberOfSignatures: {
                dataType: string;
                fieldNumber: number;
            };
            mandatoryKeys: {
                type: string;
                items: {
                    dataType: string;
                };
                fieldNumber: number;
            };
            optionalKeys: {
                type: string;
                items: {
                    dataType: string;
                };
                fieldNumber: number;
            };
        };
        default: {
            mandatoryKeys: never[];
            optionalKeys: never[];
            numberOfSignatures: number;
        };
    };
    readonly transactionAssets: RegisterAsset[];
    beforeTransactionApply({ stateStore, transaction, }: TransactionApplyContext): Promise<void>;
    afterGenesisBlockApply({ genesisBlock, }: AfterGenesisBlockApplyContext<AccountKeys>): Promise<void>;
}
