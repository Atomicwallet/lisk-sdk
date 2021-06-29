import * as React from 'react';
interface FaucetConfig {
    amount: string;
    applicationUrl: string;
    tokenPrefix: string;
    logoURL?: string;
    captchaSitekey?: string;
    faucetAddress?: string;
}
export declare const getConfig: () => Promise<FaucetConfig>;
declare global {
    interface Window {
        grecaptcha: any;
    }
}
export declare const App: React.FC;
export {};
