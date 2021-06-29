import * as React from 'react';
import { Props as TextProps } from '../Text';
export interface TickerProps extends TextProps {
    seconds: number;
}
declare const Ticker: React.FC<TickerProps>;
export default Ticker;
