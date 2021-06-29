"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areHeadersContradicting = void 0;
const areHeadersContradicting = (b1, b2) => {
    let earlierBlock = b1;
    let laterBlock = b2;
    const higherMaxHeightPreviouslyForged = earlierBlock.asset.maxHeightPreviouslyForged > laterBlock.asset.maxHeightPreviouslyForged;
    const sameMaxHeightPreviouslyForged = earlierBlock.asset.maxHeightPreviouslyForged === laterBlock.asset.maxHeightPreviouslyForged;
    const higherMaxHeightPrevoted = earlierBlock.asset.maxHeightPrevoted > laterBlock.asset.maxHeightPrevoted;
    const sameMaxHeightPrevoted = earlierBlock.asset.maxHeightPrevoted === laterBlock.asset.maxHeightPrevoted;
    const higherHeight = earlierBlock.height > laterBlock.height;
    if (higherMaxHeightPreviouslyForged ||
        (sameMaxHeightPreviouslyForged && higherMaxHeightPrevoted) ||
        (sameMaxHeightPreviouslyForged && sameMaxHeightPrevoted && higherHeight)) {
        [earlierBlock, laterBlock] = [laterBlock, earlierBlock];
    }
    if (!earlierBlock.generatorPublicKey.equals(laterBlock.generatorPublicKey)) {
        return false;
    }
    if (earlierBlock.id.equals(laterBlock.id)) {
        return false;
    }
    if (earlierBlock.asset.maxHeightPrevoted === laterBlock.asset.maxHeightPrevoted &&
        earlierBlock.height >= laterBlock.height) {
        return true;
    }
    if (earlierBlock.height > laterBlock.asset.maxHeightPreviouslyForged) {
        return true;
    }
    if (earlierBlock.asset.maxHeightPrevoted > laterBlock.asset.maxHeightPrevoted) {
        return true;
    }
    return false;
};
exports.areHeadersContradicting = areHeadersContradicting;
//# sourceMappingURL=header_contradicting.js.map