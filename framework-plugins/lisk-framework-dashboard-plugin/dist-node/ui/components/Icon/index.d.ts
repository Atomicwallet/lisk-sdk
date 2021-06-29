import * as React from 'react';
export interface Props {
    name: string;
    size?: 's' | 'm' | 'l' | 'xl';
}
declare const Icon: React.FC<Props>;
export default Icon;
