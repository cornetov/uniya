import { XmlNodeType } from "./XmlNode";
/**
 * @class Read XML parameters.
 * @name XmlReaderOptions
 */
export declare class XmlReaderOptions {
    /**
     * Indicating whether to do character checking.
     */
    check: boolean;
    /**
     * Indicating whether to ignore comments.
     */
    ignoreComments: boolean;
    /**
     * Indicating  whether to ignore meta (processing instructions).
     */
    ignoreMeta: boolean;
    /**
     * Indicating whether to ignore insignificant white space.
     */
    ignoreWhitespace: boolean;
    /**
     * The position offset. The default is 0.
     */
    startOffset: number;
}
/**
 * @class Abstract read XML data.
 * @name XmlReader
 */
export declare abstract class XmlReader {
    private _depth;
    private _normalize;
    private _attributeIndex;
    private _options;
    private _nodeType;
    private _nodeName;
    private _nodeValue;
    private _attributes;
    private _namespaces;
    constructor(options: XmlReaderOptions | undefined);
    /**
     * Gets attributes on the current node.
     */
    readonly attributes: Map<string, string>;
    /**
     * Gets type of the current node.
     */
    readonly nodeType: XmlNodeType;
    /**
     * Gets value of the current node or epmty string.
     */
    readonly value: string;
    /**
     * Gets depth of the current node in the XML document.
     */
    readonly depth: number;
    /**
     * Gets value of this node or epmty string.
     */
    readonly eof: boolean;
    /**
     * Gets true if has attributes, otherwise false.
     */
    readonly hasAttributes: boolean;
    /**
     * Gets true if has attributes, otherwise false.
     */
    readonly hasValue: boolean;
    /**
     * Gets a value indicating whether the current node is an empty element (for example, <SomeElement />).
     */
    readonly isEmptyElement: boolean;
    /**
     * Gets the local name of the current node.
     */
    readonly localName: string;
    /**
     * Gets the local name of the current node.
     */
    readonly prefix: string;
    /**
     * Gets the local name of the current node.
     */
    readonly name: string;
    /**
     * Gets the namespace URI of the current node; otherwise an empty string.
     */
    readonly namespaceURI: string;
    /**
     * Gets the options for using in parent classes.
     */
    protected readonly options: XmlReaderOptions;
    /**
     *
     * @param name The local name for the attribute.
     * @param ns The namespace URI of the XML document.
     */
    getAttributeNS(localName: string, namespaceURI: string): string | null;
    /**
     * Move to first node attribute, if attribute exist then true; otherwise false.
     */
    moveToFirstAttribute(): boolean;
    /**
     * Move to next node attribute, if successfully then true; false if there are no more attributes to read.
     */
    moveToNextAttribute(): boolean;
    /**
     * The next node was read, if successfully then true; false if there are no more nodes to read.
     */
    read(): boolean;
    /**
     * Gets next char in the XML reader (for overrides); otherwise (end read) empty string.
     * @param count The count of chars (using count changed the current position).
     */
    protected abstract nextText(count: number): string;
    /**
     * Gets the current position for the XML reader (for overrides).
     */
    protected abstract getPosition(): number;
    /**
     * Sets current position in the XML reader (for overrides); otherwise (end read) empty string.
     * @param position The new current position.
     */
    protected abstract setPosition(position: number): boolean;
    private clear;
    private nextCode;
    private parseComment;
    private parseCData;
    private parseAttribute;
    private parseAttributes;
    private parseText;
    private parseDocTypeDeclaration;
    private parseMeta;
    private parseEndElement;
    private parseElementContext;
    private parseDocumentContent;
    private parseElement;
}
