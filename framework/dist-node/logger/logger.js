"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.createDirIfNotExist = void 0;
const path = require("path");
const fs = require("fs");
const bunyan = require("bunyan");
const util = require("util");
const createDirIfNotExist = (filePath) => {
    const dir = path.dirname(filePath);
    if (fs.existsSync(dir)) {
        return;
    }
    fs.mkdirSync(dir, { recursive: true });
};
exports.createDirIfNotExist = createDirIfNotExist;
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    meganta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};
const setColor = (color, str) => `${colors[color]}${str}${colors.reset}`;
const levelToName = {
    10: setColor('yellow', 'TRACE'),
    20: setColor('meganta', 'DEBUG'),
    30: setColor('cyan', 'INFO'),
    40: setColor('yellow', 'WARN'),
    50: setColor('red', 'ERROR'),
    60: setColor('red', 'FATAL'),
};
class ConsoleLog {
    write(rec) {
        try {
            const { time, level, name, msg, module, err, hostname, pid, src, v, ...others } = rec;
            let log = util.format('%s %s %s: %s (module=%s)\n', new Date(time).toLocaleTimeString('en-US', { hour12: false }), levelToName[level], name, msg, module !== null && module !== void 0 ? module : 'unknown');
            if (err) {
                log += util.format('Message: %s \n Trace: %s \n', err.message, err.stack);
            }
            if (Object.keys(others).length > 0) {
                log += util.format('%s \n', JSON.stringify(others, (_, val) => {
                    if (typeof val === 'object') {
                        for (const k of Object.keys(val)) {
                            if (typeof val[k] === 'bigint') {
                                val[k] = val[k].toString();
                            }
                            if (Buffer.isBuffer(val[k])) {
                                val[k] = val[k].toString('hex');
                            }
                        }
                    }
                    return val;
                }, ' '));
            }
            process.stdout.write(log);
        }
        catch (err) {
            console.error('Failed on logging', err);
        }
    }
}
class FileLog {
    constructor(filePath) {
        this._stream = fs.createWriteStream(filePath, { flags: 'a', encoding: 'utf8' });
    }
    write(rec) {
        const { time, level, name, msg, module: moduleName, hostname, pid, src, v, ...others } = rec;
        const log = {
            time,
            level,
            name,
            msg,
            hostname,
            pid,
            module: moduleName !== null && moduleName !== void 0 ? moduleName : 'unknown',
        };
        const otherKeys = Object.entries(others);
        if (otherKeys.length > 0) {
            const meta = otherKeys.reduce((prev, [key, value]) => {
                if (typeof value === 'bigint') {
                    prev[key] = value.toString();
                }
                else if (Buffer.isBuffer(value)) {
                    prev[key] = value.toString('hex');
                }
                else if (value instanceof Error) {
                    prev[key] = util.format('Message: %s. Trace: %s.', value.message, value.stack);
                }
                else {
                    prev[key] = value;
                }
                return prev;
            }, {});
            log.meta = meta;
        }
        this._stream.write(`${JSON.stringify(log)}\n`);
    }
    end() {
        this._stream.end();
    }
    destroy() {
        this._stream.destroy();
    }
}
const createLogger = ({ fileLogLevel, consoleLogLevel, logFilePath, module, }) => {
    const consoleSrc = consoleLogLevel === 'debug' || consoleLogLevel === 'trace';
    const consoleStream = consoleLogLevel !== 'none'
        ? [
            {
                type: 'raw',
                level: consoleLogLevel,
                stream: new ConsoleLog(),
            },
        ]
        : [];
    const fileSrc = fileLogLevel === 'debug' || fileLogLevel === 'trace';
    const fileStream = fileLogLevel !== 'none'
        ? [
            {
                type: 'raw',
                level: fileLogLevel,
                stream: new FileLog(logFilePath),
            },
        ]
        : [];
    const streams = [...consoleStream, ...fileStream];
    return bunyan.createLogger({
        name: 'lisk-framework',
        streams,
        src: consoleSrc || fileSrc,
        serializers: { err: bunyan.stdSerializers.err },
        module,
    });
};
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map