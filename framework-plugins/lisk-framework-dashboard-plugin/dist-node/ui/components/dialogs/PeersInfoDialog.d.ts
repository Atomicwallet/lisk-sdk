import * as React from 'react';
import { DialogProps } from '../dialog';
interface PeerInfoDialogProps extends DialogProps {
    peersInfo: {
        connected: number;
        disconnected: number;
        banned: number;
    };
}
declare const PeersInfoDialog: React.FC<PeerInfoDialogProps>;
export default PeersInfoDialog;
