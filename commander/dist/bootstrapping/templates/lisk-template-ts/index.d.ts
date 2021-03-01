import InitGenerator from './generators/init_generator';
import InitPluginGenerator from './generators/init_plugin_generator';
import PluginGenerator from './generators/plugin_generator';
import ModuleGenerator from './generators/module_generator';
import AssetGenerator from './generators/asset_generator';
export declare const generators: {
    init: typeof InitGenerator;
    initPlugin: typeof InitPluginGenerator;
    plugin: typeof PluginGenerator;
    module: typeof ModuleGenerator;
    asset: typeof AssetGenerator;
};
