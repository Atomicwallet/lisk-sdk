import * as React from 'react';
import { NodeInfo, Transaction } from '../../types';
interface WidgetProps {
    transactions: Transaction[];
    nodeInfo?: NodeInfo;
    title: string;
}
declare const TransactionWidget: React.FC<WidgetProps>;
export default TransactionWidget;
