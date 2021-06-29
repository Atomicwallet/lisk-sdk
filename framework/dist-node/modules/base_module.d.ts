import { GenesisConfig, AccountSchema, TransactionApplyContext, AfterBlockApplyContext, BeforeBlockApplyContext, AfterGenesisBlockApplyContext, Reducers, Actions, BaseModuleDataAccess } from '../types';
import { BaseAsset } from './base_asset';
import { Logger } from '../logger/logger';
export interface BaseModuleChannel {
    publish(name: string, data?: Record<string, unknown>): void;
}
export declare abstract class BaseModule {
    readonly config: GenesisConfig;
    transactionAssets: BaseAsset[];
    reducers: Reducers;
    actions: Actions;
    events: string[];
    accountSchema?: AccountSchema;
    protected _logger: Logger;
    protected _channel: BaseModuleChannel;
    protected _dataAccess: BaseModuleDataAccess;
    abstract name: string;
    abstract id: number;
    constructor(genesisConfig: GenesisConfig);
    init(input: {
        channel: BaseModuleChannel;
        dataAccess: BaseModuleDataAccess;
        logger: Logger;
    }): void;
    beforeTransactionApply?(context: TransactionApplyContext): Promise<void>;
    afterTransactionApply?(context: TransactionApplyContext): Promise<void>;
    afterGenesisBlockApply?(context: AfterGenesisBlockApplyContext): Promise<void>;
    beforeBlockApply?(context: BeforeBlockApplyContext): Promise<void>;
    afterBlockApply?(context: AfterBlockApplyContext): Promise<void>;
}
