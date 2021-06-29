import { PluginOptionsWithAppConfig } from 'lisk-framework';
export interface dashboardPluginOptions extends PluginOptionsWithAppConfig {
    applicationUrl: string;
    host: string;
    port: number;
}
