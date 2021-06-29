import * as React from 'react';
interface State {
    open: boolean;
    title: string;
    body: React.ReactNode;
    backBtn: boolean;
}
export declare const MessageDialogProviderContext: React.Context<{
    state: State;
    dispatch: (state: State) => void;
}>;
declare const MessageDialogProvider: React.FC;
export default MessageDialogProvider;
