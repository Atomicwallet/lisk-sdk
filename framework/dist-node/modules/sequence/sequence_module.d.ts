import { BaseModule } from '../base_module';
import { TransactionApplyContext } from '../../types';
export declare class SequenceModule extends BaseModule {
    name: string;
    id: number;
    accountSchema: {
        type: string;
        properties: {
            nonce: {
                fieldNumber: number;
                dataType: string;
            };
        };
        default: {
            nonce: bigint;
        };
    };
    beforeTransactionApply({ transaction, stateStore, }: TransactionApplyContext): Promise<void>;
    afterTransactionApply({ transaction, stateStore, }: TransactionApplyContext): Promise<void>;
}
