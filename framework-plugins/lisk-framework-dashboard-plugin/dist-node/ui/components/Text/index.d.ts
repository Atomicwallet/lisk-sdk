import * as React from 'react';
export interface Props {
    color?: 'green' | 'pink' | 'yellow' | 'blue' | 'white' | 'gray' | 'platinum_gray' | 'red';
    type?: 'h1' | 'h2' | 'h3' | 'p' | 'tr';
    style?: 'light';
    className?: string;
}
declare const Text: React.FC<Props>;
export default Text;
