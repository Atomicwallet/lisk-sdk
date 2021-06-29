import * as React from 'react';
export declare type SelectInputOptionType = {
    label: string;
    value: string;
};
interface SingleSelectProps {
    options: SelectInputOptionType[];
    multi: false;
    onChange?: (value: SelectInputOptionType) => void;
    selected?: SelectInputOptionType;
}
interface MultiSelectProps {
    options: SelectInputOptionType[];
    multi: true;
    onChange?: (value: SelectInputOptionType[]) => void;
    selected?: SelectInputOptionType[];
}
declare type Props = SingleSelectProps | MultiSelectProps;
declare const SelectInput: React.FC<Props>;
export default SelectInput;
