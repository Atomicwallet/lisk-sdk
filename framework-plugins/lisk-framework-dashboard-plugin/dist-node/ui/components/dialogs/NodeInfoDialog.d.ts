import * as React from 'react';
import { DialogProps } from '../dialog';
import { NodeInfo } from '../../types';
interface NodeInfoDialogProps extends DialogProps {
    nodeInfo: NodeInfo;
}
declare const NodeInfoDialog: React.FC<NodeInfoDialogProps>;
export default NodeInfoDialog;
