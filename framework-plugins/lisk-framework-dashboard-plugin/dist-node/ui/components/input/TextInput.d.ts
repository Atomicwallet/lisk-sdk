import * as React from 'react';
interface Props {
    placeholder?: string;
    value?: string;
    onChange?: (val: string) => void;
}
declare const TextInput: React.FC<Props>;
export default TextInput;
