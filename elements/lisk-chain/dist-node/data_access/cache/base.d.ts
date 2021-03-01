export declare abstract class Base<T> {
    private _items;
    private readonly _minCachedItems;
    private readonly _maxCachedItems;
    private _needsRefill;
    constructor(minCachedItems: number, maxCachedItems: number);
    get items(): T[];
    get length(): number;
    get maxCachedItems(): number;
    get minCachedItems(): number;
    get first(): T;
    get last(): T;
    empty(): T[];
    set needsRefill(needRefill: boolean);
    get needsRefill(): boolean;
    abstract add(item: T): T[];
}
