import * as React from 'react';
import { CallActionOptions } from '../../types';
interface WidgetProps {
    actions: string[];
    onSubmit: (data: CallActionOptions) => void;
}
declare const CallActionWidget: React.FC<WidgetProps>;
export default CallActionWidget;
