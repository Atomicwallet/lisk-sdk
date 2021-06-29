"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = void 0;
const blocks_1 = require("./blocks");
const transactions_1 = require("./transactions");
var PROMETHEUS_TYPE;
(function (PROMETHEUS_TYPE) {
    PROMETHEUS_TYPE["gauge"] = "gauge";
    PROMETHEUS_TYPE["counter"] = "counter";
    PROMETHEUS_TYPE["histogram"] = "histogram";
})(PROMETHEUS_TYPE || (PROMETHEUS_TYPE = {}));
const prometheusExporter = (data) => {
    let exportData = '';
    for (const param of data) {
        exportData += `# HELP ${param.metric} ${param.label}\n# TYPE ${param.metric} ${param.type}\n${param.values.reduce((val, el) => {
            val += `${param.metric}${el.key} ${el.value}\n`;
            return val;
        }, '')}\n`;
    }
    return exportData;
};
const getData = (channel, state) => async (_req, res, next) => {
    try {
        const connectedPeers = await channel.invoke('app:getConnectedPeers');
        const disconnectedPeers = await channel.invoke('app:getDisconnectedPeers');
        const nodeInfo = await channel.invoke('app:getNodeInfo');
        const blockStats = await blocks_1.getBlockStats(channel, state);
        const transactionStats = await transactions_1.getTransactionStats(channel, state);
        const data = [
            {
                label: 'Average number of times blocks received',
                type: PROMETHEUS_TYPE.gauge,
                metric: 'lisk_avg_times_blocks_received_info',
                values: [
                    {
                        key: '',
                        value: blockStats.averageReceivedBlocks,
                    },
                ],
            },
            {
                label: 'Average number of times transactions received',
                type: PROMETHEUS_TYPE.gauge,
                metric: 'lisk_avg_times_transactions_received_info',
                values: [
                    {
                        key: '',
                        value: transactionStats.averageReceivedTransactions,
                    },
                ],
            },
            {
                label: 'Node Height',
                type: PROMETHEUS_TYPE.gauge,
                metric: 'lisk_node_height_total',
                values: [
                    {
                        key: '',
                        value: nodeInfo.height,
                    },
                ],
            },
            {
                label: 'Finalized Height',
                type: PROMETHEUS_TYPE.gauge,
                metric: 'lisk_finalized_height_total',
                values: [
                    {
                        key: '',
                        value: nodeInfo.finalizedHeight,
                    },
                ],
            },
            {
                label: 'Unconfirmed transactions',
                type: PROMETHEUS_TYPE.gauge,
                metric: 'lisk_unconfirmed_transactions_total',
                values: [
                    {
                        key: '',
                        value: nodeInfo.unconfirmedTransactions,
                    },
                ],
            },
            {
                label: 'Total number of peers',
                type: PROMETHEUS_TYPE.gauge,
                metric: 'lisk_peers_total',
                values: [
                    {
                        key: '{state="connected"}',
                        value: connectedPeers.length,
                    },
                    {
                        key: '{state="disconnected"}',
                        value: disconnectedPeers.length,
                    },
                ],
            },
            {
                label: 'Fork events',
                type: PROMETHEUS_TYPE.gauge,
                metric: 'lisk_fork_events_total',
                values: [
                    {
                        key: '',
                        value: state.forks.forkEventCount,
                    },
                ],
            },
        ];
        res.set('Content-Type', 'text/plain');
        res.status(200).send(prometheusExporter(data));
    }
    catch (err) {
        next(err);
    }
};
exports.getData = getData;
//# sourceMappingURL=prometheus.js.map