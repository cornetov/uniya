import { XmlTextReader } from "./XmlTextReader";

/**
 * @enum XML node type.
 */
export enum XmlNodeType {
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
    XmlDeclaration = 17,
};

// ------------------------------------------------------------------------------------------------

/**
 * The error when XML argument is incorrect.
 * @class XmlArgumentError.
 */
export class XmlArgumentError extends Error {

    /**
     * Create incorrect argument exception.
     * @param argumentName {string} The name of the argument.
     */
    constructor(argumentName: string) {
        super(`Incorrect XML argument: ${argumentName}`);
    }
}

/**
 * The error when XML format is incorrect.
 * @class XmlFormatException.
 */
export class XmlFormatError extends Error {

    /**
     * Create incorrect format exception.
     * @param reason {string} The name of the format.
     */
    constructor(reason: string) {
        super(`Incorrect XML format: ${reason}`);
    }
}

/**
 * The error of unexpected or unknown name.
 * @class XmlUnexpectedError.
 */
export class XmlUnexpectedError extends Error {

    /**
     * Create unexpected name exception.
     * @param name {string} The name that unexpected.
     */
    constructor(name: string) {
        super(`Unexpected or unknown ${name}`);
    }
}

// ------------------------------------------------------------------------------------------------

/**
 * @class XML node set.
 */
export class XmlNodeSet {

    // ** fields
    private _parentNode: XmlNode;
    private _items: Set<XmlNode>;

    // ** ctor
    constructor(parent: XmlNode) {
        //
        this._parentNode = parent;
        this._items = new Set<XmlNode>();
    }

    // ** properties

    /**
     * Gets items count (length of items) of this collection.
     */
    public get size(): number {
        return this._items.size;
    }

    // ** methods

    /**
     * Gets indication exist a typed value in this collection.
     * @param value {XmlNode} The typed value.
     */
    public has(value: XmlNode): boolean {
        return this._items.has(value);
    }

    /**
     * Add value for this collection, returned index.
     * @param value {XmlNode} The typed value.
     */
    public add(value: XmlNode): boolean {
        if (value !== null && (this._parentNode === null || this._parentNode.canParent)) {
            value.parentNode = this._parentNode;
            this._items.add(value);
            return true;
        }
        return false;
    }
    /**
     * Add range of values for this collection, returned index.
     * @param value {Set<XmlNode> | Array<XmlNode>} The collection value.
     */
    public addRange(array: Set<XmlNode> | Array<XmlNode>): boolean {
        let done = true;
        let list = new Set<XmlNode>();
        for (let node of array) {
            const exist = this.has(node);
            if (!this.add(node)) {
                done = false;
                break;
            } else if (!exist) {
                list.add(node);
            }
        }
        if (!done) {
            for (let node of list) {
                this.delete(node);
            }
        }
        return done;
    }
    /**
     * Remove item for this set, if exist that returned deleted value.
     * @param value The typed value for set.
     */
    public delete(value: XmlNode): boolean {
        if (this._items.has(value)) {
            this._items.delete(value);
            return true;
        }
        return false;
    }

    /**
     * Clear all items from this collection.
     */
    public clear(): void {
        for (let node of this._items) {
            node.parentNode = null;
        }
        this._items.clear();
    }
    /**
     * Create clone collection of this collection.
     */
    public clone(): XmlNodeSet {
        var clone = new XmlNodeSet(this._parentNode);
        for (let node of this._items) {
            clone.add(node.clone());
        }
        return clone;
    }

    /**
     * Convert this collection to array.
     */
    public toArray(): Array<XmlNode> {
        return [...this._items];
    }
    /**
     * Gets items set of this collection.
     */
    public toSet(): Set<XmlNode> {
        return this._items;
    }
}

/**
 * @class XML node.
 */
export class XmlNode {

    // ** fields
    private _nodeType: XmlNodeType = XmlNodeType.None;
    private _nodeName: string;
    private _nodeValue: string | null;
    private _attributes = new Map<string, string>();
    private _childNodes: XmlNodeSet;

    /**
     * Gets or sets the XML parent node for this node.
     */
    public parentNode: XmlNode | null = null;

    // ** ctor
    constructor(type: XmlNodeType, name: string = "", value: string | null = null) {
        switch (type) {
            case XmlNodeType.Attribute:
            case XmlNodeType.EndElement:
            case XmlNodeType.EndEntity:
            case XmlNodeType.None:
                throw new XmlUnexpectedError(XmlNodeType[type]);
            case XmlNodeType.CDATA:
            case XmlNodeType.Comment:
            case XmlNodeType.DocumentType:
            case XmlNodeType.Entity:
            case XmlNodeType.Notation:
            case XmlNodeType.SignificantWhitespace:
            case XmlNodeType.Text:
            case XmlNodeType.Whitespace:
                if (value === null) {
                    throw new XmlArgumentError("value");
                }
                break;
            case XmlNodeType.Meta:
            case XmlNodeType.Element:
                if (!name && name.length > 0) {
                    throw new XmlArgumentError("name");
                }
                break;
            case XmlNodeType.EntityReference:
                // TODO: support its
                break;
        }
        this._childNodes = new XmlNodeSet(this);
        this._nodeValue = value;
        this._nodeName = name;
        this._nodeType = type;
    }

    // ** properties

    /**
     * Gets number of attributes on the current node.
     */
    public get attributes(): Map<string, string> {
        return this._attributes;
    }
    /**
     * Gets name of the current node or epmty string.
     */
    public get nodeName(): string {
        return (!this._nodeName) ? "" : this._nodeName;
    }
    /**
     * Gets type of the current node.
     */
    public get nodeType(): XmlNodeType {
        return this._nodeType;
    }
    /**
     * Gets value of the current node or epmty string.
     */
    public get nodeValue(): string {
        return (!this._nodeValue) ? "" : this._nodeValue;
    }

    /**
     * Gets the XML child nodes for this node.
     */
    public get childNodes(): XmlNodeSet {
        return this._childNodes;
    }
    /**
     * Gets true if has attributes, otherwise false.
     */
    public get hasAttributes(): boolean {
        return this._attributes.size > 0;
    }
    /**
     * Gets true if has attributes, otherwise false.
     */
    public get hasValue(): boolean {
        return this._nodeValue !== undefined && this._nodeValue !== null;
    }
    /**
     * Gets true if has child notes, otherwise false.
     */
    public get hasChildNodes(): boolean {
        return this._childNodes.size > 0;
    }
    /**
     * Gets true if has attributes, otherwise false.
     */
    public get canParent(): boolean {
        return this._nodeType == XmlNodeType.Document
            || this._nodeType == XmlNodeType.DocumentFragment
            || this._nodeType == XmlNodeType.Element;
    }

    // ** methods

    /**
     * Gets a XML child node by name.
     * @param name {string} The name of the child node.
     */
    public get(name: string): XmlNode | null {
        return this.search(name, 0);
    }

    /**
     * Search of XML child node by name on any depth.
     * @param name {string} The name of the child node.
     * @param depth {number} The depth for search, by default 999 as infinity.
     */
    public search(name: string, depth: number = 999): XmlNode | null {
        for (const node of this._childNodes.toSet()) {
            if (node.nodeName.toLowerCase() === name.trim().toLowerCase()) {
                return node;
            }
            if (node.hasChildNodes && depth > 0) {
                let next = node.search(name, depth - 1);
                if (next !== null) {
                    return next;
                }
            }
        }
        return null;
    }

    /**
     * Create clone of this node.
     */
    public clone(): XmlNode {
        try {
            return JSON.parse(JSON.stringify(this));
        }
        catch (ex) {

            // unexpexted error
            console.exception(ex);

            let node = new XmlNode(this.nodeType, this.nodeName, this.nodeValue);
            node.parentNode = this.parentNode;
            return node;
        }
    }

    /**
     * To string of XML node to object.
     */
    public toJSONString(): string {
        var str = JSON.stringify(this);
        return str;
    }
    /**
     * Convert node to xml text (see: parse).
     * @param tabCount {number} The count of tabs in xml text format, by default -1 (not used).
     */
    public toXMLString(tabCount: number = -1): string {

        // initialization
        let format = (tabCount >= 0);
        let attrEnd = "";
        let str = "";
        let end = "";

        // simple node types
        switch (this._nodeType) {
            case XmlNodeType.CDATA:
                return XmlNode.repeater('\t', tabCount) + '<![CDATA[' + this._nodeValue + ']]>' + (format ? '\n' : "");
            case XmlNodeType.Comment:
                return XmlNode.repeater('\t', tabCount) + '<!--' + this._nodeValue + '-->' + (format ? '\n' : "");
            case XmlNodeType.Document:
                str = XmlNode.repeater('\t', tabCount);
                break;
            case XmlNodeType.DocumentFragment:
                // TODO: DocumentFragment
                return (this._nodeValue !== null) ? this._nodeValue : "";
            case XmlNodeType.DocumentType:
                return XmlNode.repeater('\t', tabCount) + '<!' + this._nodeName + ' ' + this.nodeValue + '>' + (format ? '\n' : "");
            case XmlNodeType.Element:
                str = XmlNode.repeater('\t', tabCount) + '<' + this._nodeName;
                end = (this.hasChildNodes || this.hasValue) ? '</' + this._nodeName + '>' : '/>'
                attrEnd = '>';
                break;
            case XmlNodeType.Entity:
                return XmlNode.repeater('\t', tabCount) + '<!ENTITY ' + this._nodeValue + '>' + (format ? '\n' : "");
            case XmlNodeType.EntityReference:
                return '&' + this.nodeName + ';';
            case XmlNodeType.Meta:
                return XmlNode.repeater('\t', tabCount) + '<?' + this._nodeName + ' ' + this._nodeValue + '?>' + (format ? '\n' : "");
            case XmlNodeType.Notation:
                return XmlNode.repeater('\t', tabCount) + '<!NOTATION ' + this._nodeValue + '>' + (format ? '\n' : "");
            case XmlNodeType.SignificantWhitespace:
                return 'xml:space="preserve"';
            case XmlNodeType.Text:
                return (this._nodeValue !== null) ? this._nodeValue : "";
            case XmlNodeType.Whitespace:
                return ' ';
            case XmlNodeType.XmlDeclaration:
                str = XmlNode.repeater('\t', tabCount) + '<?' + this._nodeName;
                end = '?>';
                break;
            case XmlNodeType.Attribute:
            case XmlNodeType.EndElement:
            case XmlNodeType.EndEntity:
            case XmlNodeType.None:
            default:
                throw new XmlUnexpectedError(XmlNodeType[this._nodeType]);
        }

        // attributes
        if (this.hasAttributes) {
            for (var [key, value] of this._attributes) {
                str += ' ' + key + '="' + value + '"';
            }
        }
        str += attrEnd;

        // body
        if (this.hasChildNodes) {

            // childs
            for (const node of this._childNodes.toSet()) {
                str += node.toXMLString(format ? tabCount++ : -1);
            }
        } else if (this.hasValue) {

            // value
            str += this._nodeValue;
        }

        // done
        return str + end + (format ? '\n' : "");
    }
    public toString(): string {
        return this.toXMLString();
    }

    // ** statics

    public static repeater(s: string, count: number, text: string = ""): string {
        for (let i = 0; i < Math.max(0, count); i++) {
            text += s;
        }
        return text;
    }

    /**
     * The read and parse XML tree, if successfully then returns root XML node; otherwise null.
     * @param xml The xml text for parsing.
     */
    public static parse(xml: string): XmlNode | null {

        // initialization
        let rootNode: XmlNode | null = null;
        let reader = new XmlTextReader(xml);
        let nodes = new Map<number, XmlNode>()

        // read each node
        while (reader.read()) {

            // continue if end element
            if (reader.nodeType === XmlNodeType.EndElement) continue;

            // create node
            let node = new XmlNode(reader.nodeType, reader.name, reader.value);

            // attributes
            if (reader.hasAttributes) {
                for (var [key, value] of reader.attributes) {
                    node.attributes.set(key, value);
                }
            }

            // root or child node?
            if (reader.depth > 0) {

                // child
                let parentNode = nodes.get(reader.depth - 1);
                if (parentNode !== undefined) {
                    parentNode.childNodes.add(node);
                }
            } else {

                if (rootNode !== null) {

                    // document body
                    rootNode.childNodes.add(node);
                }
                else if (node.nodeType === XmlNodeType.DocumentType || node.nodeType === XmlNodeType.XmlDeclaration) {

                    // XML document
                    rootNode = new XmlNode(XmlNodeType.Document);
                    rootNode.childNodes.add(node);
                } else {

                    // Simple root element
                    rootNode = node;
                }
            }

            // nodes by depth
            if (node.canParent) {
                nodes.set(reader.depth, node);
            }
        }

        // done
        return rootNode;
    }
}