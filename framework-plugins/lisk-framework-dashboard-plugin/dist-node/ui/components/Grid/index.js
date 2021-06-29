"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Grid_module_scss_1 = require("./Grid.module.scss");
const Grid = props => {
    var _a, _b, _c;
    const { alignItems, children, container, fluid, justify, textAlign, row, rowBorder, xs, sm, md, lg, xl, } = props;
    const columns = (_a = props.columns) !== null && _a !== void 0 ? _a : 12;
    const rowSpacing = (_b = props.rowSpacing) !== null && _b !== void 0 ? _b : props.spacing;
    const colSpacing = (_c = props.colSpacing) !== null && _c !== void 0 ? _c : props.spacing;
    const classes = [
        container ? Grid_module_scss_1.default[`grid-${columns}`] : '',
        container && rowSpacing ? Grid_module_scss_1.default[`gridRowSpacing-${rowSpacing}`] : '',
        container && colSpacing ? Grid_module_scss_1.default[`gridColSpacing-${colSpacing}`] : '',
        row ? Grid_module_scss_1.default.gridRow : '',
        fluid ? Grid_module_scss_1.default.gridFluid : '',
        row && justify ? Grid_module_scss_1.default[`gridRowJustify-${justify}`] : '',
        row && alignItems ? Grid_module_scss_1.default[`gridRowAlignItems-${alignItems}`] : '',
        row && rowBorder ? Grid_module_scss_1.default.gridRowBorder : '',
        !row && !container ? Grid_module_scss_1.default.gridCol : '',
        !row && !container && textAlign ? Grid_module_scss_1.default[`gridColTextAlign-${textAlign}`] : '',
        !row && xl ? Grid_module_scss_1.default[`gridCol-xl-${xl}`] : '',
        !row && lg ? Grid_module_scss_1.default[`gridCol-lg-${lg}`] : '',
        !row && md ? Grid_module_scss_1.default[`gridCol-md-${md}`] : '',
        !row && sm ? Grid_module_scss_1.default[`gridCol-sm-${sm}`] : '',
        !row && xs ? Grid_module_scss_1.default[`gridCol-xs-${xs}`] : '',
    ];
    return React.createElement("div", { className: classes.filter(Boolean).join(' ') }, children);
};
exports.default = Grid;
//# sourceMappingURL=index.js.map