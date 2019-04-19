import { XmlReaderOptions, XmlReader } from "./XmlReader";

/**
 * @class Reader of text XML data.
 * @name XmlTextReader
 */
export class XmlTextReader extends XmlReader {

    // ** fields
    private _xml: string;
    private _position: number;

    // ** ctor
    constructor(xml: string, options: XmlReaderOptions | undefined = undefined) {
        super(options);
        this._xml = (!xml) ? "" : xml;
        this._position = this.options.startOffset;
    }

    /**
     * Gets next char in the XML reader (for overrides); otherwise (end read) empty string.
     * @param count The count of chars (using count changed the current position).
     */
    protected nextText(count: number = 1): string {
        let position = this._position;
        if (position + count <= this._xml.length) {
            this._position += count;
            return this._xml.substr(position, count);
        }
        return "";
    }
    /**
     * Gets the current position for the XML reader (for overrides).
     */
    protected getPosition(): number {
        return this._position;
    }
    /**
     * Sets current position in the XML reader (for overrides); otherwise (end read) empty string.
     * @param position The new current position.
     */
    protected setPosition(position: number = 0): boolean {
        if (position >= 0 && position <= this._xml.length) {
            this._position = position;
            return true;
        }
        return false;
    }
}