"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const yeoman = require("yeoman-environment");
const env = yeoman.createEnv();
exports.env = env;
env.register(require.resolve('./generators/init_generator'), 'lisk:init');
env.register(require.resolve('./generators/init_plugin_generator'), 'lisk:init:plugin');
env.register(require.resolve('./generators/plugin_generator'), 'lisk:generate:plugin');
env.register(require.resolve('./generators/module_generator'), 'lisk:generate:module');
env.register(require.resolve('./generators/asset_generator'), 'lisk:generate:asset');
//# sourceMappingURL=env.js.map