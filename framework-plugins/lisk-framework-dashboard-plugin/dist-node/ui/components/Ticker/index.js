"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Text_1 = require("../Text");
const Ticker = props => {
    const [seconds, setSeconds] = React.useState(props.seconds);
    React.useEffect(() => {
        let timeout;
        if (seconds > 0) {
            timeout = setTimeout(() => setSeconds(seconds - 1), 1000);
        }
        return () => clearTimeout(timeout);
    }, [seconds]);
    return React.createElement(Text_1.default, Object.assign({}, props), seconds);
};
exports.default = Ticker;
//# sourceMappingURL=index.js.map