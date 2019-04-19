import { Core } from "./Core";

/**
 * @class Typed stack.
 */
export class Stack<T> {

    // ** fields
    private _items = new Array<T>();

    // ** properties

    /**
     * Gets items count (length of items) size of this collection.
     */
    public get length(): number {
        return this._items.length;
    }

    // ** methods

    /**
     * Whether a typed value in this stack or not.
     * @param node
     */
    public contains(value: T): boolean {
        return this._items.indexOf(value) !== -1;
    }
    /**
     * Push to this stack the typed value.
     * @param value The typed value.
     */
    public push(value: T): void {
        if (this.inserting(value)) {
            this._items.push(value);
            if (value != null) {
                this.inserted(value);
            }
        }
    }
    /**
     * Pop from this stack a typed value.
     * @param value The typed value or null.
     */
    public pop(): T | null {
        let item = this.peek();
        if (item != null && this.removing(item as T)) {
            item = this._items.pop() as T;
            if (item !== null) {
                this.removed(item);
            }
        }
        return item;
    }

    /**
     * Gets value, if not exist that null.
     * @param index The typed value or null.
     */
    public peek(): T | null {
        let index = this._items.length - 1;
        if (index >= 0) {
            return this._items[index];
        }
        return null;
    }

    /**
     * Stack call function for each element.
     * @param callback The function with two parameters (item and index).
     */
    public forEach(callback: (item: T, index: number, array: Array<T>) => void): void {

        this._items.forEach((value, idx) => {
            callback(value, idx, this._items);
        });
    }

    /**
     * Clear all items from this collection.
     */
    public clear(): void {
        let i = 0;
        while (i < this._items.length) {
            let previous = this._items[i];
            if (this.removing(previous)) {
                this._items.splice(i, 1);
                if (previous != null) {
                    this.removed(previous);
                }
            } else {
                // next index
                i++;
            }
        }
    }
    /**
     * Create clone collection of this collection.
     */
    public clone(): Stack<T> {
        var clone = new Stack<T>();
        for (let i = 0; i < this._items.length; i++) {
            clone.push(Core.clone(this._items[i]));
        }
        return clone;
    }

    /**
     * Convert this stack to array.
     */
    public toArray(): Array<T> {
        return this._items;
    }

    /**
     * Called on inserting value into this stack (for overrides), return false for stop insertion.
     * @param value The inserted typed value.
     */
    protected inserting(value: T): boolean {
        // for override from user code
        return true;
    }
    /**
     * Called on removing value into this stack (for overrides), return false for stop removing.
     * @param value The inserted typed value.
     */
    protected removing(value: T): boolean {
        // for override from user code
        return true;
    }
    /**
     * Called on inserted no null value into this stack (for overrides).
     * @param value The inserted typed value.
     */
    protected inserted(value: T) {
        // for override from user code
    }
    /**
     * Called on removed no null value into this stack (for overrides).
     * @param value The inserted typed value.
     */
    protected removed(value: T) {
        // for override from user code
    }
}

/**
 * @class Typed collection.
 */
export class Collection<T> {

    // ** fields
    private _items: Array<T> = [];

    // ** properties

    /**
     * Gets items count (length of items) of this collection.
     */
    public get length(): number {
        return this._items.length;
    }

    /**
     * Gets items array of this collection.
     */
    protected get items(): Array<T> {
        return this._items;
    }

    // ** methods

    /**
     * Gets value, if not exist that null.
     * @param index {number} The item's index.
     */
    public get(index: number): T | null {
        if (index !== undefined && index >= 0 && index < this._items.length) {
            return this._items[index];
        }
        return null;
    }
    /**
     * Sets pair (key and value), if key not exist then the pair add, if exist that returned previous value.
     * @param index {number} The item's index.
     * @param value {T} The typed value.
     */
    public set(index: number, value: T): T | null {

        let previous: T | null = null;
        if (index !== undefined && index >= 0) {

            // sanity index (insert null values)
            if (index > this._items.length) {
                for (let i = this._items.length; i < index; i++) {
                    //this.set(i, null);
                }
            }

            // sanity undefined
            if (value === undefined) {
                //value = null;
            }

            // set pair
            if (index === this._items.length) {
                // added?
                if (this.inserting(value)) {
                    this._items.push(value);
                    if (value != null) {
                        this.inserted(index, value);
                    }
                }
            } else {
                // replace
                previous = this._items[index];
                if (this.removing(value) && this.inserting(value)) {
                    this._items[index] = value;
                    if (value != null) {
                        this.inserted(index, value);
                    }
                    if (previous != null) {
                        this.removed(index, previous);
                    }
                }
            }
        }

        // done
        return previous;
    }

    /**
     * Gets indication exist a typed value in this collection.
     * @param value {T} The typed value.
     */
    public has(value: T): boolean {
        return this._items.indexOf(value) !== -1;
    }
    /**
     * Add value for this collection, returned index.
     * @param value {T} The typed value.
     */
    public add(value: T): number {
        let idx = this._items.length;
        this.set(idx, value);
        return idx;
    }
    /**
     * Add range of values for this collection, returned index.
     * @param value {Collection<T>} The collection value.
     */
    public addRange(array: Collection<T> | Array<T>): void {

        array.forEach((value: T, idx: number) => this.add(value));
    }
    /**
     * Remove item for this collection, if exist that returned deleted value.
     * @param value The typed value for set.
     */
    public remove(value: T): number {
        let index = this._items.indexOf(value);
        if (index >= 0) {
            this.removeAt(index);
        }
        return index;
    }

    // remove item, if exist that returned deleted value
    // @param number index (integer)
    // @result object (deleted value)
    public removeAt(index: number): T | null {
        let previous: T | null = null;
        if (index >= 0 && index < this._items.length) {

            previous = this._items[index];
            if (this.removing(previous)) {
                this._items.splice(index, 1);
                if (previous != null) {
                    this.removed(index, previous);
                }
            }
        }
        return previous;
    }

    /**
     * Collection call function for each element.
     * @param callback The function with two parameters (item and index).
     */
    public forEach(callback: (item: T, index: number, array: Array<T>) => void): void {

        this._items.forEach((value, idx) => {
            callback(value, idx, this._items);
        });
    }

    /**
     * Clear all items from this collection.
     */
    public clear(): void {
        let i = 0;
        while (i < this._items.length) {
            let previous = this._items[i];
            if (this.removing(previous)) {
                this._items.splice(i, 1);
                if (previous != null) {
                    this.removed(i, previous);
                }
            } else {
                // next index
                i++;
            }
        }
    }
    /**
     * Create clone collection of this collection.
     */
    public clone(): Collection<T> {
        var clone = new Collection<T>();
        for (let i = 0; i < this._items.length; i++) {
            clone.set(i, Core.clone(this._items[i]));
        }
        return clone;
    }

    /**
     * Convert this collection to array.
     */
    public toArray(): Array<T> {
        return this._items;
    }

    /**
     * Called on inserting value into this collection (for overrides), return false for stop insertion.
     * @param value {T} The typed value.
     */
    protected inserting(value: T): boolean {
        // for override from user code
        return true;
    }
    /**
     * Called on removing value into this collection (for overrides), return false for stop removing.
     * @param value {T} The typed value.
     */
    protected removing(value: T): boolean {
        // for override from user code
        return true;
    }
    /**
     * Called on inserted no null value into this collection (for overrides).
     * @param index {number} The index that was inserted or added.
     * @param value {T} The typed value.
     */
    protected inserted(index: number, value: T) {
        // for override from user code
    }
    /**
     * Called on removed no null value into this collection (for overrides).
     * @param index {number} The index that was removed.
     * @param value {T} The typed value.
     */
    protected removed(index: number, value: T) {
        // for override from user code
    }
}