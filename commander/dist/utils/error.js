"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
class FileSystemError extends Error {
    constructor(message) {
        super(message);
        this.message = chalk.red(message);
        this.name = 'FileSystemError';
    }
}
exports.FileSystemError = FileSystemError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.message = chalk.red(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=error.js.map