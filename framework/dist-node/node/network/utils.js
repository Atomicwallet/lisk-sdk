"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupPeersIPs = void 0;
const net_1 = require("net");
const dns_1 = require("dns");
const lookupPromise = async (hostname, options) => new Promise((resolve, reject) => {
    dns_1.lookup(hostname, options, (err, address) => {
        if (err) {
            return reject(err);
        }
        return resolve(address);
    });
});
const lookupPeersIPs = async (peersList, enabled) => {
    if (!enabled) {
        return [];
    }
    return Promise.all(peersList.map(async (peer) => {
        const { ip } = peer;
        if (net_1.isIPv4(ip)) {
            return peer;
        }
        try {
            const address = await lookupPromise(ip, { family: 4 });
            return {
                ...peer,
                ip: address,
            };
        }
        catch (err) {
            console.error(`Failed to resolve peer domain name ${ip} to an IP address`);
            return peer;
        }
    }));
};
exports.lookupPeersIPs = lookupPeersIPs;
//# sourceMappingURL=utils.js.map