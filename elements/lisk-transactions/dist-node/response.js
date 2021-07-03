"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = exports.Status = void 0;
var Status;
(function (Status) {
    Status[Status["FAIL"] = 0] = "FAIL";
    Status[Status["OK"] = 1] = "OK";
    Status[Status["PENDING"] = 2] = "PENDING";
})(Status = exports.Status || (exports.Status = {}));
const createResponse = (id, errors) => ({
    id,
    status: errors && errors.length > 0 ? Status.FAIL : Status.OK,
    errors: errors ? errors : [],
});
exports.createResponse = createResponse;
//# sourceMappingURL=response.js.map