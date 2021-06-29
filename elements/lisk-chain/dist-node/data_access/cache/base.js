"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
class Base {
    constructor(minCachedItems, maxCachedItems) {
        this._minCachedItems = minCachedItems;
        this._maxCachedItems = maxCachedItems;
        this._items = [];
        this._needsRefill = false;
    }
    get items() {
        return this._items;
    }
    get length() {
        return this.items.length;
    }
    get maxCachedItems() {
        return this._maxCachedItems;
    }
    get minCachedItems() {
        return this._minCachedItems;
    }
    get first() {
        return this.items[0];
    }
    get last() {
        return this.items[this.length - 1];
    }
    empty() {
        this._items = [];
        return this.items;
    }
    set needsRefill(needRefill) {
        this._needsRefill = needRefill;
    }
    get needsRefill() {
        return this._needsRefill;
    }
}
exports.Base = Base;
//# sourceMappingURL=base.js.map