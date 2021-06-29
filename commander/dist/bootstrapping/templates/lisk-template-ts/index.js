"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generators = void 0;
const init_generator_1 = require("./generators/init_generator");
const init_plugin_generator_1 = require("./generators/init_plugin_generator");
const plugin_generator_1 = require("./generators/plugin_generator");
const module_generator_1 = require("./generators/module_generator");
const asset_generator_1 = require("./generators/asset_generator");
exports.generators = {
    init: init_generator_1.default,
    initPlugin: init_plugin_generator_1.default,
    plugin: plugin_generator_1.default,
    module: module_generator_1.default,
    asset: asset_generator_1.default,
};
//# sourceMappingURL=index.js.map