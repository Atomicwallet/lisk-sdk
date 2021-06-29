"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockCache = void 0;
const assert = require("assert");
const base_1 = require("./base");
class BlockCache extends base_1.Base {
    add(blockHeader) {
        if (this.items.length) {
            assert(blockHeader.height === this.last.height + 1, `Block header with height ${(this.last.height + 1).toString()} can only be added, instead received height ${blockHeader.height.toString()}`);
        }
        if (this.first && blockHeader.height === this.last.height + 1) {
            this.items.push(blockHeader);
        }
        else {
            this.items.unshift(blockHeader);
        }
        if (this.items.length > this.maxCachedItems) {
            this.items.shift();
        }
        return this.items;
    }
    refill(blockHeaders) {
        this.items.unshift(...blockHeaders);
        this.needsRefill = false;
        return this.items;
    }
    remove(id) {
        if (this.items.length && !this.last.id.equals(id)) {
            throw new Error(`Failed to remove the block id: ${id.toString('hex')} which is not the last block header cached`);
        }
        this.items.pop();
        if (this.items.length < this.minCachedItems) {
            this.needsRefill = true;
        }
        return this.items;
    }
    getByID(id) {
        return this.items.find(block => block.id.equals(id));
    }
    getByIDs(ids) {
        const blocks = this.items.filter(block => ids.find(id => id.equals(block.id)) !== undefined);
        if (blocks.length === ids.length) {
            return blocks.reverse();
        }
        return [];
    }
    getByHeight(height) {
        return this.items.find(block => block.height === height);
    }
    getByHeights(heightList) {
        const blocks = this.items.filter(block => heightList.includes(block.height));
        if (blocks.length === heightList.length) {
            return blocks.reverse();
        }
        return [];
    }
    getByHeightBetween(fromHeight, toHeight) {
        if (toHeight >= fromHeight &&
            this.items.length &&
            fromHeight >= this.first.height &&
            toHeight <= this.last.height) {
            return this.items
                .filter(block => block.height >= fromHeight && block.height <= toHeight)
                .reverse();
        }
        return [];
    }
}
exports.BlockCache = BlockCache;
//# sourceMappingURL=block.js.map