"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var axios = tslib_1.__importStar(require("axios"));
var fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
var commons_1 = require("./core/commons");
var worker_process_1 = require("./worker-process");
exports.download = function (url, cacheDir) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var CACHE_EXPIRY_IN_DAYS, _a, filePath, fileDir, writeStream, response;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                CACHE_EXPIRY_IN_DAYS = 2;
                _a = commons_1.getDownloadedFileInfo(url, cacheDir), filePath = _a.filePath, fileDir = _a.fileDir;
                if (fs_extra_1.default.existsSync(filePath)) {
                    if (commons_1.dateDiff(new Date(), fs_extra_1.default.statSync(filePath).birthtime) <=
                        CACHE_EXPIRY_IN_DAYS) {
                        return [2];
                    }
                    fs_extra_1.default.unlinkSync(filePath);
                }
                fs_extra_1.default.ensureDirSync(fileDir);
                writeStream = fs_extra_1.default.createWriteStream(filePath);
                return [4, axios.default({
                        url: url,
                        method: 'GET',
                        responseType: 'stream',
                    })];
            case 1:
                response = _b.sent();
                response.data.pipe(writeStream);
                return [2, new Promise(function (resolve, reject) {
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                    })];
        }
    });
}); };
exports.validateChecksum = function (url, cacheDir) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _a, fileName, fileDir, stderr;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = commons_1.getDownloadedFileInfo(url, cacheDir), fileName = _a.fileName, fileDir = _a.fileDir;
                return [4, worker_process_1.exec("shasum -c " + fileName, {
                        cwd: fileDir,
                    })];
            case 1:
                stderr = (_b.sent()).stderr;
                if (!stderr) {
                    return [2];
                }
                throw new Error("Checksum validation failed with error: " + stderr);
        }
    });
}); };
exports.extract = function (filePath, fileName, outDir) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _a, stdout, stderr;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4, worker_process_1.exec("tar xf " + fileName + " -C " + outDir + " --strip-component=1;", { cwd: filePath })];
            case 1:
                _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                if (stderr) {
                    throw new Error("Extraction failed with error: " + stderr);
                }
                return [2, stdout];
        }
    });
}); };
exports.downloadAndValidate = function (url, cacheDir) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, exports.download(url, cacheDir)];
            case 1:
                _a.sent();
                return [4, exports.download(url + ".SHA256", cacheDir)];
            case 2:
                _a.sent();
                return [4, exports.validateChecksum(url + ".SHA256", cacheDir)];
            case 3:
                _a.sent();
                return [2];
        }
    });
}); };
//# sourceMappingURL=download.js.map