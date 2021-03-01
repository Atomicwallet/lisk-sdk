import { ActionsDefinition, BasePlugin, BaseChannel, EventsDefinition, PluginInfo } from 'lisk-framework';
export declare class ForgerPlugin extends BasePlugin {
    private _forgerPluginDB;
    private _channel;
    private _forgersList;
    private _transactionFees;
    private _syncingWithNode;
    static get alias(): string;
    static get info(): PluginInfo;
    get defaults(): object;
    get events(): EventsDefinition;
    get actions(): ActionsDefinition;
    load(channel: BaseChannel): Promise<void>;
    unload(): Promise<void>;
    private _setForgersList;
    private _setTransactionFees;
    private _getForgerHeaderAndPayloadInfo;
    private _syncForgerInfo;
    private _subscribeToChannel;
    private _addForgerInfo;
    private _revertForgerInfo;
    private _getForgerReceivedVotes;
    private _addVotesReceived;
    private _revertVotesReceived;
    private _getFee;
    private _updateMissedBlock;
}
