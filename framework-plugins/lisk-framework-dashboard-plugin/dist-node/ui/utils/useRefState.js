"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const useRefState = (a) => {
    const [state, _setState] = React.useState(a);
    const stateRef = React.useRef(state);
    const setState = (val) => {
        stateRef.current = val;
        _setState(val);
    };
    return [state, setState, stateRef];
};
exports.default = useRefState;
//# sourceMappingURL=useRefState.js.map