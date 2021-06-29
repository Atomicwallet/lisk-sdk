"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardPlugin = void 0;
const lisk_utils_1 = require("@liskhq/lisk-utils");
const lisk_framework_1 = require("lisk-framework");
const express = require("express");
const path_1 = require("path");
const defaults = require("./defaults");
const packageJSON = require('../../package.json');
class DashboardPlugin extends lisk_framework_1.BasePlugin {
    static get alias() {
        return 'dashboard';
    }
    static get info() {
        return {
            author: packageJSON.author,
            version: packageJSON.version,
            name: packageJSON.name,
        };
    }
    get defaults() {
        return defaults.config;
    }
    get events() {
        return [];
    }
    get actions() {
        return {};
    }
    async load(_channel) {
        this._options = lisk_utils_1.objects.mergeDeep({}, defaults.config.default, this.options);
        const config = {
            applicationUrl: this._options.applicationUrl,
            applicationName: this._options.applicationName,
        };
        const app = express();
        app.use(express.static(path_1.join(__dirname, '../../build')));
        app.get('/api/config', (_req, res) => res.json(config));
        this._server = app.listen(this._options.port, this._options.host);
    }
    async unload() {
        await new Promise((resolve, reject) => {
            this._server.close(err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
exports.DashboardPlugin = DashboardPlugin;
//# sourceMappingURL=dashboard_plugin.js.map