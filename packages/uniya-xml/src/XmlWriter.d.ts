/**
 * @class Abstract wtite XML data.
 * @name XmlWriter
 */
export declare abstract class XmlWriter {
    private static name_regex;
    private _indent;
    private _stack;
    private _types;
    private _started_write;
    private _namespaces;
    constructor(indent?: string);
    /**
     * Gets indication of to use indens.
     */
    readonly useIndent: boolean;
    /**
     * Gets current XML depth.
     */
    readonly depth: number;
    /**
     * Flush changes.
     */
    flush(): void;
    /**
     * Start write of a XML document.
     * @param version The XML document version, by default 1.0.
     * @param encoding The encoding that will be in XML file, by default not apply.
     * @param standalone The indication standalone the XML documnet, by default no.
     */
    startDocument(version?: string, encoding?: string, standalone?: boolean): XmlWriter;
    /**
     * Done write of the XML document.
     */
    endDocument(): XmlWriter;
    /**
     * Write a XML element with name and content.
     * @param name The name of the XML element.
     * @param content The content of the XML element.
     */
    writeElement(name: string, content: string): XmlWriter;
    /**
     * Write a XML element of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML element.
     * @param localName The local name of the XML element.
     * @param uri The URI oth the namespace for the XML element.
     * @param content The content of the XML element.
     */
    writeElementNS(prefix: string, localName: string, uri: string, content: string): XmlWriter;
    /**
     * Start write a XML element.
     * @param name The name of the XML element.
     */
    startElement(name: string): XmlWriter;
    /**
     * Start write a XML element of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML element.
     * @param localName The local name of the XML element.
     * @param uri The URI of the namespace for the XML element.
     */
    startElementNS(prefix: string, localName: string, uri: string): XmlWriter;
    /**
     * End write XML element.
     */
    endElement(): XmlWriter;
    /**
     * Write a XML attribute.
     * @param name The name of the XML attribute.
     * @param content The text content of the XML attribute.
     */
    writeAttribute(name: string, content: string): XmlWriter;
    /**
     * Start write a XML attribute of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML attribute.
     * @param localName The local name of the XML attribute.
     * @param uri The URI of the namespace for the XML attribute.
     * @param content The text content of the XML attribute, byt default null.
     */
    writeAttributeNS(prefix: string, name: string, uri: string, content?: string): XmlWriter;
    /**
     * Start write a XML attribute.
     * @param name The name of the XML attribute.
     */
    startAttribute(name: string): XmlWriter;
    /**
     * Start write a XML attribute of the namespace with URI.
     * @param prefix The namespace prefix of the name of the XML attribute.
     * @param localName The local name of the XML attribute.
     * @param uri The URI of the namespace for the XML attribute.
     */
    startAttributeNS(prefix: string, localName: string, uri: string): XmlWriter;
    /**
     * End write a XML attribute.
     * @param name The name of the XML attribute.
     */
    endAttribute(): XmlWriter;
    /**
     * Write content as comment for this XML writer.
     * @param content The text content as comment data.
     */
    writeComment(content: string): XmlWriter;
    /**
     * Start comment ('<!--').
     */
    startComment(): XmlWriter;
    /**
     * End comment ('-->').
     */
    endComment(): XmlWriter;
    /**
     * Write XML document type.
     * @param name The name of the XML document.
     * @param pubId The public identifier of the XML document.
     * @param sysId The system identifier of the XML document.
     * @param subset The subset of the XML document.
     */
    writeDocumentType(name: string, pubId?: string, sysId?: string, subset?: string): XmlWriter;
    /**
     * Start write XML document type.
     * @param name The name of the XML document.
     * @param pubId The public identifier of the XML document.
     * @param sysId The system identifier of the XML document.
     * @param subset The subset of the XML document.
     */
    startDocumentType(name: string, pubId: string, sysId: string, subset: string): XmlWriter;
    /**
     * End write XML document type.
     */
    endDocumentType(): XmlWriter;
    /**
     * Write XML meta (processing instruction).
     * @param name The name of the XML meta ('pi').
     * @param content The text content as meta data.
     */
    writeMeta(name: string, content: string): XmlWriter;
    /**
     * Start write XML meta (processing instruction).
     * @param name The name of the XML meta ('pi').
     */
    startMeta(name: string): XmlWriter;
    /**
     * End write XML meta (processing instruction).
     */
    endMeta(): XmlWriter;
    /**
     * Write XML CDATA.
     * @param content The text content of CDATA.
     */
    writeCData(content: string): XmlWriter;
    /**
     * Start write XML CDATA.
     */
    startCData(): XmlWriter;
    /**
     * End write XML CDATA.
     */
    endCData(): XmlWriter;
    /**
     * Write raw XML text data.
     * @param content The text content.
     */
    writeRaw(content: string): XmlWriter;
    /**
     * Write some text arguments (for overrides).
     * @param args The array of text arguments.
     */
    protected abstract write(...args: string[]): void;
    private indenter;
    private startAttributes;
    private endAttributes;
    private text;
    /**
     * Convert any value to XML string.
     * @param value {any} The value to text convert.
     */
    static toXMLString(value: any): string;
}
