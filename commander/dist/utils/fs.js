'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var fs_1 = require('fs');
exports.readJSONSync = function(path) {
	var contents = fs_1.readFileSync(path, 'utf8');
	var stripped = contents.replace(/^\uFEFF/, '');
	return JSON.parse(stripped);
};
exports.writeJSONSync = function(path, contents) {
	var json = JSON.stringify(contents, undefined, '\t');
	fs_1.writeFileSync(path, json);
};
//# sourceMappingURL=fs.js.map
