import * as React from 'react';
import { Props as IconProps } from '../Icon';
import { Props as TextProps } from '../Text';
export interface Props extends Partial<IconProps>, TextProps {
    text: string;
}
declare const CopiableText: React.FC<Props>;
export default CopiableText;
