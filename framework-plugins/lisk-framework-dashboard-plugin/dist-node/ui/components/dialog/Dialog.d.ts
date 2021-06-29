import * as React from 'react';
export interface DialogProps {
    open: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}
export declare const DialogContext: React.Context<{
    closeDialog: () => void;
}>;
declare const Dialog: React.FC<DialogProps>;
export default Dialog;
