"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequence = void 0;
const util = require("util");
const defaultConfig = {
    onWarning: undefined,
    warningLimit: 50,
};
const defaultTickInterval = 1;
class Sequence {
    constructor(config) {
        var _a, _b;
        this._queue = [];
        this._queue = [];
        this._config = {
            onWarning: (_a = config === null || config === void 0 ? void 0 : config.onWarning) !== null && _a !== void 0 ? _a : defaultConfig.onWarning,
            warningLimit: (_b = config === null || config === void 0 ? void 0 : config.warningLimit) !== null && _b !== void 0 ? _b : defaultConfig.warningLimit,
        };
        const nextSequence = async () => {
            if (this._config.onWarning && this._queue.length >= this._config.warningLimit) {
                this._config.onWarning(this._queue.length, this._config.warningLimit);
            }
            await this._tick();
            setTimeout(nextSequence, defaultTickInterval);
        };
        nextSequence();
    }
    async add(worker) {
        if (!util.types.isAsyncFunction(worker)) {
            throw new Error('Worker must be an async function.');
        }
        let done = { resolve: () => { }, reject: () => { } };
        const workerPromise = new Promise((resolve, reject) => {
            done = { resolve, reject };
        });
        const task = { worker, done };
        this._queue.push(task);
        return workerPromise;
    }
    count() {
        return this._queue.length;
    }
    async _tick() {
        const task = this._queue.shift();
        if (!task) {
            return;
        }
        try {
            const result = await task.worker();
            task.done.resolve(result);
        }
        catch (error) {
            task.done.reject(error);
        }
    }
}
exports.Sequence = Sequence;
//# sourceMappingURL=sequence.js.map