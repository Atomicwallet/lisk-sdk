"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extract = exports.downloadAndValidate = exports.getChecksum = exports.verifyChecksum = exports.download = exports.getDownloadedFileInfo = void 0;
const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs-extra");
const tar = require("tar");
const path = require("path");
const getDownloadedFileInfo = (url, downloadDir) => {
    const pathWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '').split('/');
    const fileName = pathWithoutProtocol.pop();
    const filePath = path.join(downloadDir, fileName);
    return {
        fileName,
        fileDir: downloadDir,
        filePath,
    };
};
exports.getDownloadedFileInfo = getDownloadedFileInfo;
const download = async (url, dir) => {
    const { filePath, fileDir } = exports.getDownloadedFileInfo(url, dir);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    fs.ensureDirSync(fileDir);
    const writeStream = fs.createWriteStream(filePath);
    const response = await axios.default({
        url,
        method: 'GET',
        responseType: 'stream',
        maxContentLength: 5000,
    });
    response.data.pipe(writeStream);
    return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
};
exports.download = download;
const verifyChecksum = async (filePath, expectedChecksum) => {
    const fileStream = fs.createReadStream(filePath);
    const dataHash = crypto.createHash('sha256');
    const fileHash = await new Promise((resolve, reject) => {
        fileStream.on('data', (datum) => {
            dataHash.update(datum);
        });
        fileStream.on('error', error => {
            reject(error);
        });
        fileStream.on('end', () => {
            resolve(dataHash.digest());
        });
    });
    const fileChecksum = fileHash.toString('hex');
    if (fileChecksum !== expectedChecksum) {
        throw new Error(`File checksum: ${fileChecksum} mismatched with expected checksum: ${expectedChecksum}`);
    }
};
exports.verifyChecksum = verifyChecksum;
const getChecksum = (url, dir) => {
    const { filePath } = exports.getDownloadedFileInfo(url, dir);
    const content = fs.readFileSync(`${filePath}.SHA256`, 'utf8');
    if (!content) {
        throw new Error(`Invalid filepath: ${filePath}`);
    }
    return content.split(' ')[0];
};
exports.getChecksum = getChecksum;
const downloadAndValidate = async (url, dir) => {
    await exports.download(url, dir);
    await exports.download(`${url}.SHA256`, dir);
    const { filePath } = exports.getDownloadedFileInfo(url, dir);
    const checksum = exports.getChecksum(url, dir);
    await exports.verifyChecksum(filePath, checksum);
};
exports.downloadAndValidate = downloadAndValidate;
const extract = async (filePath, fileName, outDir) => tar.x({
    file: path.join(filePath, fileName),
    cwd: outDir,
    strip: 1,
});
exports.extract = extract;
//# sourceMappingURL=download.js.map