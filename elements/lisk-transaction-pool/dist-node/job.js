"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
class Job {
    constructor(job, interval) {
        this._active = false;
        this._interval = interval;
        this._job = job;
    }
    async start() {
        if (!this._active) {
            this._active = true;
            return this.run();
        }
    }
    stop() {
        if (this._active && this._id !== undefined) {
            clearTimeout(this._id);
            this._id = undefined;
            this._active = false;
        }
    }
    async callJobAfterTimeout() {
        return new Promise(resolve => {
            this._id = setTimeout(async () => {
                await this._job();
                resolve();
            }, this._interval);
        });
    }
    async run() {
        while (this._active) {
            await this.callJobAfterTimeout();
        }
    }
}
exports.Job = Job;
//# sourceMappingURL=job.js.map