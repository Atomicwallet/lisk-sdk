import * as React from 'react';
interface Props {
    onClick?: (event: React.MouseEvent | Event) => void;
    size?: 's' | 'm' | 'l' | 'xl';
    disabled?: boolean;
}
declare const Button: React.FC<Props>;
export default Button;
