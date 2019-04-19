/**
 * @class Typed stack.
 */
export declare class Stack<T> {
    private _items;
    /**
     * Gets items count (length of items) size of this collection.
     */
    readonly length: number;
    /**
     * Whether a typed value in this stack or not.
     * @param node
     */
    contains(value: T): boolean;
    /**
     * Push to this stack the typed value.
     * @param value The typed value.
     */
    push(value: T): void;
    /**
     * Pop from this stack a typed value.
     * @param value The typed value or null.
     */
    pop(): T | null;
    /**
     * Gets value, if not exist that null.
     * @param index The typed value or null.
     */
    peek(): T | null;
    /**
     * Stack call function for each element.
     * @param callback The function with two parameters (item and index).
     */
    forEach(callback: (item: T, index: number, array: Array<T>) => void): void;
    /**
     * Clear all items from this collection.
     */
    clear(): void;
    /**
     * Create clone collection of this collection.
     */
    clone(): Stack<T>;
    /**
     * Convert this stack to array.
     */
    toArray(): Array<T>;
    /**
     * Called on inserting value into this stack (for overrides), return false for stop insertion.
     * @param value The inserted typed value.
     */
    protected inserting(value: T): boolean;
    /**
     * Called on removing value into this stack (for overrides), return false for stop removing.
     * @param value The inserted typed value.
     */
    protected removing(value: T): boolean;
    /**
     * Called on inserted no null value into this stack (for overrides).
     * @param value The inserted typed value.
     */
    protected inserted(value: T): void;
    /**
     * Called on removed no null value into this stack (for overrides).
     * @param value The inserted typed value.
     */
    protected removed(value: T): void;
}
/**
 * @class Typed collection.
 */
export declare class Collection<T> {
    private _items;
    /**
     * Gets items count (length of items) of this collection.
     */
    readonly length: number;
    /**
     * Gets items array of this collection.
     */
    protected readonly items: Array<T>;
    /**
     * Gets value, if not exist that null.
     * @param index {number} The item's index.
     */
    get(index: number): T | null;
    /**
     * Sets pair (key and value), if key not exist then the pair add, if exist that returned previous value.
     * @param index {number} The item's index.
     * @param value {T} The typed value.
     */
    set(index: number, value: T): T | null;
    /**
     * Gets indication exist a typed value in this collection.
     * @param value {T} The typed value.
     */
    has(value: T): boolean;
    /**
     * Add value for this collection, returned index.
     * @param value {T} The typed value.
     */
    add(value: T): number;
    /**
     * Add range of values for this collection, returned index.
     * @param value {Collection<T>} The collection value.
     */
    addRange(array: Collection<T> | Array<T>): void;
    /**
     * Remove item for this collection, if exist that returned deleted value.
     * @param value The typed value for set.
     */
    remove(value: T): number;
    removeAt(index: number): T | null;
    /**
     * Collection call function for each element.
     * @param callback The function with two parameters (item and index).
     */
    forEach(callback: (item: T, index: number, array: Array<T>) => void): void;
    /**
     * Clear all items from this collection.
     */
    clear(): void;
    /**
     * Create clone collection of this collection.
     */
    clone(): Collection<T>;
    /**
     * Convert this collection to array.
     */
    toArray(): Array<T>;
    /**
     * Called on inserting value into this collection (for overrides), return false for stop insertion.
     * @param value {T} The typed value.
     */
    protected inserting(value: T): boolean;
    /**
     * Called on removing value into this collection (for overrides), return false for stop removing.
     * @param value {T} The typed value.
     */
    protected removing(value: T): boolean;
    /**
     * Called on inserted no null value into this collection (for overrides).
     * @param index {number} The index that was inserted or added.
     * @param value {T} The typed value.
     */
    protected inserted(index: number, value: T): void;
    /**
     * Called on removed no null value into this collection (for overrides).
     * @param index {number} The index that was removed.
     * @param value {T} The typed value.
     */
    protected removed(index: number, value: T): void;
}
