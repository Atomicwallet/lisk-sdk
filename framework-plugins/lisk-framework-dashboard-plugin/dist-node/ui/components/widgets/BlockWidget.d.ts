import * as React from 'react';
import { Block } from '../../types';
interface WidgetProps {
    blocks: Block[];
    title: string;
}
declare const BlockWidget: React.FC<WidgetProps>;
export default BlockWidget;
