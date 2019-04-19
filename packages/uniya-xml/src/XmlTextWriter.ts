import { XmlWriter } from "./XmlWriter";

/**
 * @class Writer of text XML data.
 * @name XmlTextWriter
 */
export class XmlTextWriter extends XmlWriter {

    // ** fields
    private _output: string = "";

    // ** ctor
    constructor(indent: string = "") {
        super(indent);
    }

    /**
     * Write some text arguments (for overrides).
     * @param args The array of text arguments.
     */
    protected write(...args: string[]) {
        for (var i = 0; i < args.length; i++) {
            this._output += args[i];
        }
    }

    /**
     * Override object to string.
     */
    toString(): string {
        this.flush();
        return this._output;
    }
}