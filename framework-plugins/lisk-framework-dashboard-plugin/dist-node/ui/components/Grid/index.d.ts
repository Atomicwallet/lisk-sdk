import * as React from 'react';
declare type GridItemsAlignment = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
declare type GridJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
declare type TextAlign = 'center' | 'left' | 'right' | 'justify';
declare type GridSizes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
declare type GridSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6;
declare type OverrideProps<M, N> = {
    [P in keyof M]: P extends keyof N ? N[P] : M[P];
};
interface GridBaseProps {
    container?: undefined;
    fluid?: undefined;
    rowSpacing?: undefined;
    colSpacing?: undefined;
    spacing?: undefined;
    columns?: number;
    row?: undefined;
    rowBorder?: undefined;
    alignItems?: undefined;
    justify?: undefined;
    xs?: undefined;
    sm?: undefined;
    md?: undefined;
    lg?: undefined;
    xl?: undefined;
    textAlign?: undefined;
}
declare type GridContainerProps = OverrideProps<GridBaseProps, {
    container?: true;
    fluid?: boolean;
    rowSpacing?: GridSpacing;
    colSpacing?: GridSpacing;
    spacing?: GridSpacing;
    columns?: 12 | 15;
}>;
declare type GridRowProps = OverrideProps<GridBaseProps, {
    row?: true;
    rowBorder?: boolean;
    alignItems?: GridItemsAlignment;
    justify?: GridJustify;
}>;
declare type GridColProps = OverrideProps<GridBaseProps, {
    xs?: GridSizes;
    sm?: GridSizes;
    md?: GridSizes;
    lg?: GridSizes;
    xl?: GridSizes;
    textAlign?: TextAlign;
}>;
declare type GridProps = GridContainerProps | GridRowProps | GridColProps;
declare const Grid: React.FC<GridProps>;
export default Grid;
