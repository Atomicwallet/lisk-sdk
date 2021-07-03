"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Status;
(function (Status) {
    Status[Status["FAIL"] = 0] = "FAIL";
    Status[Status["OK"] = 1] = "OK";
    Status[Status["PENDING"] = 2] = "PENDING";
})(Status = exports.Status || (exports.Status = {}));
exports.createResponse = (id, errors) => ({
    id,
    status: errors && errors.length > 0 ? Status.FAIL : Status.OK,
    errors: errors ? errors : [],
});
//# sourceMappingURL=response.js.map