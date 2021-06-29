import * as React from 'react';
interface BoxProp extends React.HTMLAttributes<HTMLDivElement> {
    mt?: number;
    mb?: number;
    ml?: number;
    mr?: number;
    pt?: number;
    pb?: number;
    pl?: number;
    pr?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    hideDown?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    hideUp?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showDown?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showUp?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
declare const Box: React.FC<BoxProp>;
export default Box;
