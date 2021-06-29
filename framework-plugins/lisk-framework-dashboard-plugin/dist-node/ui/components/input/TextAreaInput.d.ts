import * as React from 'react';
interface Props {
    placeholder?: string;
    value?: string;
    onChange?: (val: string) => void;
    size?: 's' | 'm' | 'l';
    json?: boolean;
    readonly?: boolean;
}
declare const TextAreaInput: React.FC<Props>;
export default TextAreaInput;
