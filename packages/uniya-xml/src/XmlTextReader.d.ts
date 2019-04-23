import { XmlReaderOptions, XmlReader } from "./XmlReader";
/**
 * @class Reader of text XML data.
 * @name XmlTextReader
 */
export declare class XmlTextReader extends XmlReader {
    private _xml;
    private _position;
    constructor(xml: string, options?: XmlReaderOptions | undefined);
    /**
     * Gets next char in the XML reader (for overrides); otherwise (end read) empty string.
     * @param count The count of chars (using count changed the current position).
     */
    protected nextText(count?: number): string;
    /**
     * Gets the current position for the XML reader (for overrides).
     */
    protected getPosition(): number;
    /**
     * Sets current position in the XML reader (for overrides); otherwise (end read) empty string.
     * @param position The new current position.
     */
    protected setPosition(position?: number): boolean;
}
