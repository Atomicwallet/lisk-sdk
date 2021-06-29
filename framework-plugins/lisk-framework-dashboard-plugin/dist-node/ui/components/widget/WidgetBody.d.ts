import * as React from 'react';
interface Props {
    size?: 'm' | 'l' | 's' | 'xs';
    scrollbar?: boolean;
    mode?: 'dark' | 'light';
}
declare const WidgetBody: React.FC<Props>;
export default WidgetBody;
