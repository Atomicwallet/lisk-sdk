"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const json_format_highlight_1 = require("json-format-highlight");
const SelectInput_1 = require("../input/SelectInput");
const widget_1 = require("../widget");
const Text_1 = require("../Text");
const Box_1 = require("../Box");
const Widgets_module_scss_1 = require("./Widgets.module.scss");
const json_color_1 = require("../../utils/json_color");
const listToEventObject = (list) => list.map(e => ({ label: e, value: e })).flat();
const RecentEventWidget = props => {
    const [selectedEvents, setSelectedEvents] = React.useState(listToEventObject(props.selected));
    const handleSelect = (val) => {
        setSelectedEvents(val);
        props.onSelect(val.map(e => e.value));
    };
    const showHighlightJSON = (data) => json_format_highlight_1.default(JSON.stringify(data), json_color_1.jsonHighlight);
    return (React.createElement(widget_1.Widget, null,
        React.createElement(widget_1.WidgetHeader, null,
            React.createElement("div", { className: Widgets_module_scss_1.default['recent-events-heading'] },
                React.createElement(Text_1.default, { type: 'h2' }, 'Recent events'),
                React.createElement(Text_1.default, { type: 'h3' },
                    "Subscribed: ",
                    selectedEvents.length)),
            React.createElement("div", { className: Widgets_module_scss_1.default['recent-events-dropdown'] },
                React.createElement(SelectInput_1.default, { multi: true, options: listToEventObject(props.events), selected: selectedEvents, onChange: val => handleSelect(val) }),
                React.createElement(Text_1.default, { type: 'h3' },
                    "Subscribed: ",
                    selectedEvents.length))),
        React.createElement(widget_1.WidgetBody, { scrollbar: true, size: 'm' }, props.data.map(({ name, data }, index) => (React.createElement(Box_1.default, { mb: 4, key: index },
            React.createElement(Text_1.default, { type: 'h3' }, name),
            React.createElement("br", null),
            React.createElement("span", { dangerouslySetInnerHTML: { __html: showHighlightJSON(data) } })))))));
};
exports.default = RecentEventWidget;
//# sourceMappingURL=RecentEventWidget.js.map