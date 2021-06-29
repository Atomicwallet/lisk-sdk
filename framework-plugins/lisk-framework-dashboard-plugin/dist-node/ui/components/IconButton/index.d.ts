import * as React from 'react';
interface Props {
    icon: string;
    onClick?: (event: React.MouseEvent | Event) => void;
    size?: 's' | 'm' | 'l' | 'xl';
}
declare const IconButton: React.FC<Props>;
export default IconButton;
