'use strict';
var _this = this;
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var axios = tslib_1.__importStar(require('axios'));
var constants_1 = require('../constants');
var commons_1 = require('./commons');
exports.getLatestVersion = function(url) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var version;
		return tslib_1.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					return [4, axios.default.get(url)];
				case 1:
					version = _a.sent();
					return [2, version.data.trim()];
			}
		});
	});
};
exports.getReleaseInfo = function(releaseUrl, network, installVersion) {
	return tslib_1.__awaiter(_this, void 0, void 0, function() {
		var version, urlPath, liskTarUrl, liskTarSHA256Url;
		return tslib_1.__generator(this, function(_a) {
			if (releaseUrl && releaseUrl.search('.tar.gz') >= 0) {
				return [
					2,
					{
						version: commons_1.getSemver(releaseUrl),
						liskTarUrl: releaseUrl,
						liskTarSHA256Url: releaseUrl + '.SHA256',
					},
				];
			}
			version = installVersion;
			urlPath = constants_1.RELEASE_URL + '/' + network + '/' + version;
			liskTarUrl = urlPath + '/' + commons_1.liskTar(version);
			liskTarSHA256Url = urlPath + '/' + commons_1.liskTarSHA256(version);
			return [
				2,
				{
					version: version,
					liskTarUrl: liskTarUrl,
					liskTarSHA256Url: liskTarSHA256Url,
				},
			];
		});
	});
};
//# sourceMappingURL=release.js.map
