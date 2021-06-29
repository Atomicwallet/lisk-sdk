import * as React from 'react';
interface Props {
    onClick?: (event: React.MouseEvent | Event) => void;
    title: string;
    mode?: 'dark' | 'light';
}
declare const InfoPanel: React.FC<Props>;
export default InfoPanel;
