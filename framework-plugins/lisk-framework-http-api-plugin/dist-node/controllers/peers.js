"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeers = void 0;
const lisk_validator_1 = require("@liskhq/lisk-validator");
const utils_1 = require("../utils");
const getPeerSchema = {
    type: 'object',
    properties: {
        limit: {
            type: 'string',
            format: 'uint32',
            description: 'Number of peers to be returned',
        },
        offset: {
            type: 'string',
            format: 'uint32',
            description: 'Offset to get peers after a specific point in a peer list',
        },
        state: {
            type: 'string',
            enum: ['connected', 'disconnected'],
        },
    },
};
var PeerState;
(function (PeerState) {
    PeerState["connected"] = "connected";
    PeerState["disconnected"] = "disconnected";
})(PeerState || (PeerState = {}));
const getPeers = (channel) => async (req, res, next) => {
    const errors = lisk_validator_1.validator.validate(getPeerSchema, req.query);
    if (errors.length) {
        res.status(400).send({
            errors: [{ message: new lisk_validator_1.LiskValidationError([...errors]).message }],
        });
        return;
    }
    const { limit = 100, offset = 0, state = PeerState.connected } = req.query;
    try {
        let peers;
        if (state === PeerState.disconnected) {
            peers = await channel.invoke('app:getDisconnectedPeers');
        }
        else {
            peers = await channel.invoke('app:getConnectedPeers');
        }
        res.status(200).json({
            meta: { count: peers.length, limit: +limit, offset: +offset },
            data: utils_1.paginateList(peers, +limit, +offset),
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPeers = getPeers;
//# sourceMappingURL=peers.js.map