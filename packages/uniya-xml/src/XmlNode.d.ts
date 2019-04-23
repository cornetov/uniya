/**
 * @enum XML node type.
 */
export declare enum XmlNodeType {
    /**
     * Returned by the XmlReader if a Read method has not been called.
     */
    None = 0,
    /**
     * An element (for example, <item> ).
     */
    Element = 1,
    /**
     * An attribute (for example, id='123' ).
     */
    Attribute = 2,
    /**
     * A text content of a node.
     */
    Text = 3,
    /**
     * A CDATA section (for example, <![CDATA[my escaped text]]> ).
     */
    CDATA = 4,
    /**
     * A reference to an entity (for example, &num; ).
     */
    EntityReference = 5,
    /**
     * An entity declaration (for example, <!ENTITY...> ).
     */
    Entity = 6,
    /**
     * A meta data (processing instruction) (for example, <?pi test?> ).
     */
    Meta = 7,
    /**
     * A comment (for example, <!-- my comment --> ).
     */
    Comment = 8,
    /**
     * A document node that, as the root of the document tree, provides access to the entire XML document.
     */
    Document = 9,
    /**
     * The document type declaration, indicated by the following tag (for example, <!DOCTYPE...> ).
     */
    DocumentType = 10,
    /**
     * A document fragment.
     */
    DocumentFragment = 11,
    /**
     * A notation in the document type declaration (for example, <!NOTATION...> ).
     */
    Notation = 12,
    /**
     * White space between markup.
     */
    Whitespace = 13,
    /**
     * White space between markup in a mixed content model or white space within the xml:space="preserve" scope.
     */
    SignificantWhitespace = 14,
    /**
     * An end element tag (for example, </item> ).
     */
    EndElement = 15,
    /**
     * XmlReader returned when gets to the end of the entity replacement.
     */
    EndEntity = 16,
    /**
     * The XML declaration (for example, <?xml version='1.0'?> ).
     */
    XmlDeclaration = 17
}
/**
 * The error when XML argument is incorrect.
 * @class XmlArgumentError.
 */
export declare class XmlArgumentError extends Error {
    /**
     * Create incorrect argument exception.
     * @param argumentName {string} The name of the argument.
     */
    constructor(argumentName: string);
}
/**
 * The error when XML format is incorrect.
 * @class XmlFormatException.
 */
export declare class XmlFormatError extends Error {
    /**
     * Create incorrect format exception.
     * @param reason {string} The name of the format.
     */
    constructor(reason: string);
}
/**
 * The error of unexpected or unknown name.
 * @class XmlUnexpectedError.
 */
export declare class XmlUnexpectedError extends Error {
    /**
     * Create unexpected name exception.
     * @param name {string} The name that unexpected.
     */
    constructor(name: string);
}
/**
 * @class XML node set.
 */
export declare class XmlNodeSet {
    private _parentNode;
    private _items;
    constructor(parent: XmlNode);
    /**
     * Gets items count (length of items) of this collection.
     */
    readonly size: number;
    /**
     * Gets indication exist a typed value in this collection.
     * @param value {XmlNode} The typed value.
     */
    has(value: XmlNode): boolean;
    /**
     * Add value for this collection, returned index.
     * @param value {XmlNode} The typed value.
     */
    add(value: XmlNode): boolean;
    /**
     * Add range of values for this collection, returned index.
     * @param value {Set<XmlNode> | Array<XmlNode>} The collection value.
     */
    addRange(array: Set<XmlNode> | Array<XmlNode>): boolean;
    /**
     * Remove item for this set, if exist that returned deleted value.
     * @param value The typed value for set.
     */
    delete(value: XmlNode): boolean;
    /**
     * Clear all items from this collection.
     */
    clear(): void;
    /**
     * Create clone collection of this collection.
     */
    clone(): XmlNodeSet;
    /**
     * Convert this collection to array.
     */
    toArray(): Array<XmlNode>;
    /**
     * Gets items set of this collection.
     */
    toSet(): Set<XmlNode>;
}
/**
 * @class XML node.
 */
export declare class XmlNode {
    private _nodeType;
    private _nodeName;
    private _nodeValue;
    private _attributes;
    private _childNodes;
    /**
     * Gets or sets the XML parent node for this node.
     */
    parentNode: XmlNode | null;
    constructor(type: XmlNodeType, name?: string, value?: string | null);
    /**
     * Gets number of attributes on the current node.
     */
    readonly attributes: Map<string, string>;
    /**
     * Gets name of the current node or epmty string.
     */
    readonly nodeName: string;
    /**
     * Gets type of the current node.
     */
    readonly nodeType: XmlNodeType;
    /**
     * Gets value of the current node or epmty string.
     */
    readonly nodeValue: string;
    /**
     * Gets the XML child nodes for this node.
     */
    readonly childNodes: XmlNodeSet;
    /**
     * Gets true if has attributes, otherwise false.
     */
    readonly hasAttributes: boolean;
    /**
     * Gets true if has attributes, otherwise false.
     */
    readonly hasValue: boolean;
    /**
     * Gets true if has child notes, otherwise false.
     */
    readonly hasChildNodes: boolean;
    /**
     * Gets true if has attributes, otherwise false.
     */
    readonly canParent: boolean;
    /**
     * Gets a XML child node by name.
     * @param name {string} The name of the child node.
     */
    get(name: string): XmlNode | null;
    /**
     * Search of XML child node by name on any depth.
     * @param name {string} The name of the child node.
     * @param depth {number} The depth for search, by default 999 as infinity.
     */
    search(name: string, depth?: number): XmlNode | null;
    /**
     * Create clone of this node.
     */
    clone(): XmlNode;
    /**
     * To string of XML node to object.
     */
    toJSONString(): string;
    /**
     * Convert node to xml text (see: parse).
     * @param tabCount {number} The count of tabs in xml text format, by default -1 (not used).
     */
    toXMLString(tabCount?: number): string;
    toString(): string;
    static repeater(s: string, count: number, text?: string): string;
    /**
     * The read and parse XML tree, if successfully then returns root XML node; otherwise null.
     * @param xml The xml text for parsing.
     */
    static parse(xml: string): XmlNode | null;
}
