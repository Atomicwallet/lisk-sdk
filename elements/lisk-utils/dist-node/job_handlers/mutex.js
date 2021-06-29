"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutex = void 0;
class Mutex {
    constructor() {
        this._queue = [];
        this._locked = false;
    }
    async acquire() {
        const isLocked = this.isLocked();
        const releaseFunc = new Promise(resolve => this._queue.push(resolve));
        if (!isLocked) {
            this._tick();
        }
        return releaseFunc;
    }
    isLocked() {
        return this._locked;
    }
    async runExclusive(worker) {
        const release = await this.acquire();
        try {
            return await worker();
        }
        finally {
            release();
        }
    }
    _tick() {
        const releaseFunc = this._queue.shift();
        if (!releaseFunc) {
            return;
        }
        const nextReleaseFunc = () => {
            this._locked = false;
            this._tick();
        };
        this._locked = true;
        releaseFunc(nextReleaseFunc);
    }
}
exports.Mutex = Mutex;
//# sourceMappingURL=mutex.js.map