import { XmlNodeType, XmlArgumentError, XmlFormatError, XmlUnexpectedError, XmlNodeSet, XmlNode } from "./XmlNode";

/**
 * @class Abstract wtite XML data.
 * @name XmlWriter
 */
export abstract class XmlWriter {

    // ** fields
    private static name_regex = /[_:A-Za-z][-._:A-Za-z0-9]*/;
    //private indent: boolean;
    private _indent: string;
    //private _output: string = '';
    private _stack = new Array<string>();
    private _types = new Map<XmlNodeType, number>();
    //private _depth: number = 0;
    //private _attributes: number = 0;
    //private _attribute: number = 0;
    //private _texts: boolean = false;
    //private _comment: boolean = false;
    //private _dtd: boolean = false;
    //private _root: string = "";
    //private _meta: boolean = false;
    //private _cdata: boolean = false;
    private _started_write: boolean = false;
    //private _writer: Function;
    //private _writer_encoding = 'UTF-8';
    private _namespaces = new Map<string, string>();

    // ** ctor
    constructor(indent: string = "") {
        this._indent = indent;
    }

    // ** properties

    /**
     * Gets indication of to use indens.
     */
    get useIndent(): boolean {
        return this._indent.length > 0;
    }

    /**
     * Gets current XML depth.
     */
    get depth(): number {
        return this._stack.length;
    }

    // ** methods

    /**
     * Flush changes.
     */
    flush() {
        while (this._stack.length > 0) {
            let name = this._stack.pop();
            if (name !== null && name !== undefined && name.length > 0) {
                this.endElement();
            }
        }
    }

    /**
     * Start write of a XML document.
     * @param version The XML document version, by default 1.0.
     * @param encoding The encoding that will be in XML file, by default not apply.
     * @param standalone The indication standalone the XML documnet, by default no.
     */
    startDocument(version: string = "1.0", encoding: string = "", standalone: boolean = false): XmlWriter {

        // sanity
        if (this.depth > 0 || this._types.get(XmlNodeType.Attribute) as number > 0) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // xml document meta
        this.startMeta('xml');
        this.startAttribute('version');
        this.text(!version ? "1.0" : version);
        this.endAttribute();
        if (encoding.length > 0) {
            this.startAttribute('encoding');
            this.text(encoding);
            this.endAttribute();
        }
        if (standalone) {
            this.startAttribute('standalone');
            this.text("yes");
            this.endAttribute();
        }
        this.endMeta();

        // decoration
        if (this.useIndent) {
            this.write('\n');
        }

        // done
        return this;
    }
    /**
     * Done write of the XML document.
     */
    endDocument(): XmlWriter {

        // sanity
        if (this.depth > 0 || this._types.get(XmlNodeType.Attribute) as number > 0) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // decoration
        if (this.useIndent) {
            this.write('\n');
        }

        // done
        return this;
    }

    /**
     * Write a XML element with name and content.
     * @param name The name of the XML element.
     * @param content The content of the XML element.
     */
    writeElement(name: string, content: string): XmlWriter {
        return this.startElement(name).text(content).endElement();
    }
    /**
     * Write a XML element of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML element.
     * @param localName The local name of the XML element.
     * @param uri The URI oth the namespace for the XML element.
     * @param content The content of the XML element.
     */
    writeElementNS(prefix: string, localName: string, uri: string, content: string): XmlWriter {
        if (!content) {
            content = uri;
        }
        return this.startElementNS(prefix, localName, uri).text(content).endElement();
    }
    /**
     * Start write a XML element.
     * @param name The name of the XML element.
     */
    startElement(name: string): XmlWriter {

        // sanity
        if (!name.match(XmlWriter.name_regex)) {
            throw new XmlArgumentError("name");
        }

        // close attributes
        if (this._types.get(XmlNodeType.Attribute) as number > 0) {
            this.endAttributes();
        }

        // indent spaces
        if (this._started_write) {
            this.indenter();
        }
        this._started_write = true;

        // start
        this._types.set(XmlNodeType.Text, 0);
        this._stack.push(name);
        this.write('<', name);
        this.startAttributes();

        // done
        return this;
    }
    /**
     * Start write a XML element of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML element.
     * @param localName The local name of the XML element.
     * @param uri The URI of the namespace for the XML element.
     */
    startElementNS(prefix: string, localName: string, uri: string): XmlWriter {

        // sanity
        if (!prefix.match(XmlWriter.name_regex)) {
            throw new XmlArgumentError("prefix");
        }
        if (!localName.match(XmlWriter.name_regex)) {
            throw new XmlArgumentError("name");
        }

        // sanity namespaces
        if (!!uri && uri.length > 0) {
            if (this._namespaces.has(prefix)) {
                let existUri = this._namespaces.get(prefix) as string;
                if (existUri.toLowerCase() !== uri.toLowerCase()) {
                    throw new XmlArgumentError("uri");
                }
            } else {
                this._namespaces.set(prefix, uri);
            }
        }

        // done
        return this.startElement(prefix + ':' + localName);
    }
    /**
     * End write XML element.
     */
    endElement(): XmlWriter {

        // sanity
        if (this.depth <= 0) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // attributes?
        let close = false;
        if (this._types.get(XmlNodeType.Text) as number > 0) {

            // was text content
            this.indenter();
            close = true;
        }
        else {

            // end for attributes
            if (this._types.get(XmlNodeType.Attribute) as number > 1) {
                this.endAttribute();
            }
            this.write('/>');
        }

        // end
        let name = this._stack.pop();
        if (close && name !== undefined) {
            this.write('</', name, '>');
        }

        // done
        return this;
    }

    /**
     * Write a XML attribute.
     * @param name The name of the XML attribute.
     * @param content The text content of the XML attribute.
     */
    writeAttribute(name: string, content: string): XmlWriter {
        return this.startAttribute(name).text(content).endAttribute();
    }
    /**
     * Start write a XML attribute of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML attribute.
     * @param localName The local name of the XML attribute.
     * @param uri The URI of the namespace for the XML attribute.
     * @param content The text content of the XML attribute, byt default null.
     */
    writeAttributeNS(prefix: string, name: string, uri: string, content: string = uri): XmlWriter {
        return this.startAttributeNS(prefix, name, uri).text(content).endAttribute();
    }

    /**
     * Start write a XML attribute.
     * @param name The name of the XML attribute.
     */
    startAttribute(name: string): XmlWriter {

        // sanity
        if (!name.match(XmlWriter.name_regex)) {
            throw new XmlArgumentError("name");
        }

        // previous attributes
        let attrs = this._types.get(XmlNodeType.Attribute) as number;
        if (attrs <= 0) {
            throw new XmlFormatError(`XML|${this.depth}`)
        }

        // start
        this._types.set(XmlNodeType.Attribute, ++attrs);
        this.write(' ', name, '="');

        // done
        return this;
    }
    /**
     * Start write a XML attribute of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML attribute.
     * @param localName The local name of the XML attribute.
     * @param uri The URI of the namespace for the XML attribute.
     */
    startAttributeNS(prefix: string, localName: string, uri: string): XmlWriter {

        // sanity namespaces
        if (!!uri && uri.length > 0) {
            if (this._namespaces.has(prefix)) {
                let existUri = this._namespaces.get(prefix) as string;
                if (existUri.toLowerCase() !== uri.toLowerCase()) {
                    throw new XmlArgumentError("uri");
                }
            } else {
                this._namespaces.set(prefix, uri);
            }
        }

        // done
        return this.startAttribute(prefix + ':' + localName);
    }
    /**
     * End write a XML attribute.
     * @param name The name of the XML attribute.
     */
    endAttribute(): XmlWriter {

        // sanity
        let attrs = this._types.get(XmlNodeType.Attribute) as number;
        if (attrs <= 1) {
            throw new XmlFormatError('XML|${this.depth}');
        }

        // end
        this._types.set(XmlNodeType.Text, 0);
        this._types.set(XmlNodeType.Attribute, --attrs);
        this.write('"');

        // done
        return this;
    }

    /**
     * Write content as comment for this XML writer.
     * @param content The text content as comment data.
     */
    writeComment(content: string): XmlWriter {
        return this.startComment().text(content).endComment();
    }
    /**
     * Start comment ('<!--').
     */
    startComment(): XmlWriter {

        // sanity
        if (this._types.get(XmlNodeType.Comment) as number > 0) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // close attributes
        if (this._types.get(XmlNodeType.Attribute) as number > 0) {
            this.endAttributes();
        }

        // indent spaces
        this.indenter();
        this._started_write = true;

        // start
        this._types.set(XmlNodeType.Comment, 1);
        this.write('<!--');

        // done
        return this;
    }
    /**
     * End comment ('-->').
     */
    endComment(): XmlWriter {

        // sanity
        if (this._types.get(XmlNodeType.Comment) !== 1) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // end
        this._types.set(XmlNodeType.Comment, 0);
        this.write('-->');

        // done
        return this;
    }

    /**
     * Write XML document type.
     * @param name The name of the XML document.
     * @param pubId The public identifier of the XML document.
     * @param sysId The system identifier of the XML document.
     * @param subset The subset of the XML document.
     */
    writeDocumentType(name: string, pubId: string = "", sysId: string = "", subset: string = ""): XmlWriter {
        return this.startDocumentType(name, pubId, sysId, subset).endDocumentType()
    }
    /**
     * Start write XML document type.
     * @param name The name of the XML document.
     * @param pubId The public identifier of the XML document.
     * @param sysId The system identifier of the XML document.
     * @param subset The subset of the XML document.
     */
    startDocumentType(name: string, pubId: string, sysId: string, subset: string): XmlWriter {

        // sanity
        if (this.depth > 0 || this._types.get(XmlNodeType.DocumentType) as number > 0) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }
        if (!name.match(XmlWriter.name_regex)) {
            throw new XmlArgumentError("name");
        }
        if (pubId.length > 0 && !pubId.match(/^[\w\-][\w\s\-\/\+\:\.]*/)) {
            throw new XmlArgumentError("pubId");
        }
        if (subset.length > 0 && !sysId.match(/^[\w\.][\w\-\/\\\:\.]*/)) {
            throw new XmlArgumentError("sysId");
        }
        if (subset.length > 0 && !subset.match(/[\w\s\<\>\+\.\!\#\-\?\*\,\(\)\|]*/)) {
            throw new XmlArgumentError("subset");
        }

        // indent spaces
        if (this._started_write) {
            this.indenter();
        }
        this._started_write = true;


        // start
        this._types.set(XmlNodeType.DocumentType, 1);
        this.write('<!DOCTYPE ', name);
        if (pubId.length > 0) {
            this.write(' PUBLIC "', pubId);
        }
        if (sysId.length > 0) {
            if (pubId.length > 0) {
                this.write(' SYSTEM');
            }
            this.write(' "', sysId, '"');
        }
        if (subset.length > 0) {
            this.write(' [' + subset + ']');
        }
        //this.root = name;

        // done
        return this;
    }
    /**
     * End write XML document type.
     */
    endDocumentType(): XmlWriter {

        // sanity
        if (this.depth > 0 || this._types.get(XmlNodeType.DocumentType) !== 1) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // end
        this._types.set(XmlNodeType.DocumentType, 0);
        this.write('>');

        // done
        return this;
    }

    /**
     * Write XML meta (processing instruction).
     * @param name The name of the XML meta ('pi').
     * @param content The text content as meta data.
     */
    writeMeta(name: string, content: string): XmlWriter {
        return this.startMeta(name).text(content).endMeta()
    }
    /**
     * Start write XML meta (processing instruction).
     * @param name The name of the XML meta ('pi').
     */
    startMeta(name: string): XmlWriter {

        // sanity
        if (this.depth > 0 || this._types.get(XmlNodeType.Meta) as number > 0) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }
        if (!name.match(XmlWriter.name_regex)) {
            throw new XmlArgumentError("name");
        }

        // close attributes
        if (this._types.get(XmlNodeType.Attribute) as number > 0) {
            this.endAttributes();
        }

        // indent spaces
        if (this._started_write) {
            this.indenter();
        }
        this._started_write = true;

        // start
        this._types.set(XmlNodeType.Meta, 1);
        this.write('<?', name);

        // done
        return this;
    }
    /**
     * End write XML meta (processing instruction).
     */
    endMeta(): XmlWriter {

        // sanity
        if (this.depth > 0 || this._types.get(XmlNodeType.Meta) !== 1) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // close attributes
        if (this._types.get(XmlNodeType.Attribute) as number > 0) {
            this.endAttributes();
        }

        // end
        this._types.set(XmlNodeType.Meta, 0);
        this.write('?>');

        // done
        return this;
    }

    /**
     * Write XML CDATA.
     * @param content The text content of CDATA.
     */
    writeCData(content: string): XmlWriter {
        return this.startCData().text(content).endCData();
    }
    /**
     * Start write XML CDATA.
     */
    startCData(): XmlWriter {

        // sanity
        if (this._types.get(XmlNodeType.CDATA) as number > 0) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // close attributes
        if (this._types.get(XmlNodeType.Attribute) as number > 0) {
            this.endAttributes();
        }

        // indent spaces
        if (this._started_write) {
            this.indenter();
        }
        this._started_write = true;

        // start
        this._types.set(XmlNodeType.CDATA, 1);
        this.write('<![CDATA[');

        // done
        return this;
    }
    /**
     * End write XML CDATA.
     */
    endCData(): XmlWriter {

        // sanity
        if (this._types.get(XmlNodeType.CDATA) !== 1) {
            throw new XmlFormatError(`XML|${this.depth}`);
        }

        // end
        this._types.set(XmlNodeType.CDATA, 0);
        this.write(']]>');

        // done
        return this;
    }

    /**
     * Write raw XML text data.
     * @param content The text content.
     */
    writeRaw(content: string): XmlWriter {
        return this.text(content);
    }

    // ** abstact method for override

    /**
     * Write some text arguments (for overrides).
     * @param args The array of text arguments.
     */
    protected abstract write(...args: string[]): void;

    // ** implementation

    //private inside(type: XmlNodeType): boolean {
    //    this._types.has(type)
    //    return this._types.has(type) ? this._types[type] : false;
    //}

    private indenter() {
        if (this.useIndent) {
            this.write('\n');
            for (var i = 1; i < this.depth; i++) {
                this.write(this._indent);
            }
        }
    }

    private startAttributes(): XmlWriter {
        this._types.set(XmlNodeType.Attribute, 1);
        return this;
    }

    private endAttributes(): XmlWriter {

        let attrs = this._types.get(XmlNodeType.Attribute) as number;
        if (attrs > 0) {

            // close last attribute
            if (attrs > 1) {
                this.endAttribute();
            }

            // close all attributes
            if (!this._types.get(XmlNodeType.Meta)) {
                this.write('>');
            }
            this._types.set(XmlNodeType.Text, 0);
            this._types.set(XmlNodeType.Attribute, 0);
        }

        // done
        return this;
    }

    private text(content: string): XmlWriter {

        // sanity
        if (this.depth === 0
            && !this._types.get(XmlNodeType.Comment)
            && !this._types.get(XmlNodeType.CDATA)
            && !this._types.get(XmlNodeType.Meta)) {
            throw new XmlUnexpectedError(XmlNodeType[XmlNodeType.Text]);
        }

        // write
        let attrs = this._types.get(XmlNodeType.Attribute) as number;
        if (attrs > 1) {

            // attribute context
            this.write(content
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
                .replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;')
            );
        } else {

            if (attrs > 0) {

                // not clossed attributes
                this.endAttributes();
            }
            if (this._types.get(XmlNodeType.Comment) as number > 0 || this._types.get(XmlNodeType.CDATA) as number > 0) {

                // raw data
                this.write(content);
            } else {

                // meta (processing instructions)
                this.write(content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            }

            // using text
            this._types.set(XmlNodeType.Text, 1);
            this._started_write = true;
        }

        // done
        return this;
    }

    // ** static

    /**
     * Convert any value to XML string.
     * @param value {any} The value to text convert.
     */
    public static toXMLString(value: any): string {

        // sanity
        if (value === undefined || value === null) return "";

        // date
        if (value instanceof Date) {
            return value.toUTCString();
        }

        // done
        return value.toString();
    }
}