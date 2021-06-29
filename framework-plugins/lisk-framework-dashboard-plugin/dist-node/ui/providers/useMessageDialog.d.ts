import * as React from 'react';
interface UseMessageDialogProvider {
    showMessageDialog: (message: string, body: React.ReactNode, options?: {
        backButton: boolean;
    }) => void;
    closeMessageDialog: () => void;
}
declare const useMessageDialog: () => UseMessageDialogProvider;
export default useMessageDialog;
