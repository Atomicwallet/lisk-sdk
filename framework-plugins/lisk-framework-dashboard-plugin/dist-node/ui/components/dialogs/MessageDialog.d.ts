import * as React from 'react';
import { DialogProps } from '../dialog';
interface MessageDialogProps extends DialogProps {
    title: string;
    backBtn?: boolean;
}
declare const MessageDialog: React.FC<MessageDialogProps>;
export default MessageDialog;
