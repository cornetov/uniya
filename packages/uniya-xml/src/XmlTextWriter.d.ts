import { XmlWriter } from "./XmlWriter";
/**
 * @class Writer of text XML data.
 * @name XmlTextWriter
 */
export declare class XmlTextWriter extends XmlWriter {
    private _output;
    constructor(indent?: string);
    /**
     * Write some text arguments (for overrides).
     * @param args The array of text arguments.
     */
    protected write(...args: string[]): void;
    /**
     * Override object to string.
     */
    toString(): string;
}
