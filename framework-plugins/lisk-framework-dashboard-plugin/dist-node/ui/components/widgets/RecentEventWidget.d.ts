import * as React from 'react';
import { EventData } from '../../types';
interface Props {
    events: string[];
    onSelect: (eventsName: string[]) => void;
    selected: string[];
    data: EventData[];
}
declare const RecentEventWidget: React.FC<Props>;
export default RecentEventWidget;
