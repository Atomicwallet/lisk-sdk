"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagMessage = exports.createMessageTag = void 0;
const TAG_REGEX = /^([A-Za-z0-9])+$/;
const createMessageTag = (domain, version) => {
    if (!TAG_REGEX.test(domain)) {
        throw new Error(`Message tag domain must be alpha numeric without special characters. Got "${domain}".`);
    }
    if (version && !TAG_REGEX.test(version.toString())) {
        throw new Error(`Message tag version must be alpha numeric without special characters. Got "${version}"`);
    }
    return `LSK_${version ? `${domain}:${version}` : domain}_`;
};
exports.createMessageTag = createMessageTag;
const tagMessage = (tag, networkIdentifier, message) => Buffer.concat([
    Buffer.from(tag, 'utf8'),
    networkIdentifier,
    typeof message === 'string' ? Buffer.from(message, 'utf8') : message,
]);
exports.tagMessage = tagMessage;
//# sourceMappingURL=message_tag.js.map