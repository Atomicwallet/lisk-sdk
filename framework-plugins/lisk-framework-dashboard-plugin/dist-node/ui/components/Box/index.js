"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Box_module_scss_1 = require("./Box.module.scss");
const Box = props => {
    const { mt, mb, ml, mr, pt, pb, pl, pr, textAlign, showDown, showUp, hideUp, hideDown, ...rest } = props;
    if ([mt, mb, ml, mr, pt, pb, pl, pr].filter(Boolean).some(i => i < 1)) {
        throw new Error('Box margin, padding values can not be less than 1');
    }
    if ([mt, mb, ml, mr, pt, pb, pl, pr].filter(Boolean).some(i => i > 6)) {
        throw new Error('Box margin, padding values can not be greater than 5');
    }
    const classes = [
        mt ? Box_module_scss_1.default[`m-t-${mt}`] : '',
        mb ? Box_module_scss_1.default[`m-b-${mb}`] : '',
        ml ? Box_module_scss_1.default[`m-l-${ml}`] : '',
        mr ? Box_module_scss_1.default[`m-r-${mr}`] : '',
        pt ? Box_module_scss_1.default[`p-t-${pt}`] : '',
        pb ? Box_module_scss_1.default[`p-b-${pb}`] : '',
        pl ? Box_module_scss_1.default[`p-l-${pl}`] : '',
        pr ? Box_module_scss_1.default[`p-r-${pr}`] : '',
        textAlign ? Box_module_scss_1.default[`text-align-${textAlign}`] : '',
        showUp ? Box_module_scss_1.default[`showUp-${showUp}`] : '',
        hideUp ? Box_module_scss_1.default[`hideUp-${hideUp}`] : '',
        showDown ? Box_module_scss_1.default[`showDown-${showDown}`] : '',
        hideDown ? Box_module_scss_1.default[`hideDown-${hideDown}`] : '',
    ].filter(Boolean);
    if (rest.className) {
        classes.push(rest.className);
        delete rest.className;
    }
    return (React.createElement("div", Object.assign({}, rest, { className: classes.join(' ') }), props.children));
};
exports.default = Box;
//# sourceMappingURL=index.js.map