import { XmlNodeType, XmlUnexpectedError } from "./XmlNode";

/**
 * @class Read XML parameters.
 * @name XmlReaderOptions
 */
export class XmlReaderOptions {

    /**
     * Indicating whether to do character checking.
     */
    check: boolean = true;
    /**
     * Indicating whether to ignore comments.
     */
    ignoreComments: boolean = true;
    /**
     * Indicating  whether to ignore meta (processing instructions).
     */
    ignoreMeta: boolean = true;
    /**
     * Indicating whether to ignore insignificant white space.
     */
    ignoreWhitespace: boolean = true;
    /**
     * The position offset. The default is 0.
     */
    startOffset: number = 0;
}

/**
 * @class Abstract read XML data.
 * @name XmlReader
 */
export abstract class XmlReader {

    //private a: Int8Array;

    // ** fields
    //private _xml: string;
    private _depth: number = 0;
    //private _position: number = 0;
    private _closed: boolean = false;
    private _normalize: boolean = true;
    private _attributeIndex: number = -1;
    private _options: XmlReaderOptions;
    private _nodeType: XmlNodeType = XmlNodeType.None;
    private _nodeName: string = "";
    private _nodeValue: string = "";
    private _attributes = new Map<string, string>();
    private _namespaces = new Map<string, string>();

    // ** ctor
    constructor(options: XmlReaderOptions | undefined) {
        if (!options) {
            this._options = new XmlReaderOptions();
        } else {
            this._options = options;
        }
    }

    // ** properties

    /**
     * Gets attributes on the current node.
     */
    get attributes(): Map<string, string> {
        return this._attributes;
    }
    /**
     * Gets type of the current node.
     */
    get nodeType(): XmlNodeType {
        return this._nodeType;
    }
    /**
     * Gets value of the current node or epmty string.
     */
    get value(): string {
        return (!this._nodeValue) ? "" : this._nodeValue;
    }
    /**
     * Gets depth of the current node in the XML document.
     */
    get depth(): number {
        return this._depth;
    }
    /**
     * Gets value of this node or epmty string.
     */
    get eof(): boolean {
        return this._nodeType === XmlNodeType.None && this.getPosition() > 0;
    }
    /**
     * Gets true if has attributes, otherwise false.
     */
    get hasAttributes() {
        return this._attributes.size > 0;
    }
    /**
     * Gets true if has attributes, otherwise false.
     */
    get hasValue() {
        return this._nodeValue !== undefined && this._nodeValue !== null;
    }
    /**
     * Gets a value indicating whether the current node is an empty element (for example, <SomeElement />).
     */
    get isEmptyElement() {
        return this._nodeType === XmlNodeType.Element && this._nodeValue === "";
    }
    /**
     * Gets the local name of the current node.
     */
    get localName(): string {

        if (this._nodeName.indexOf(':') !== -1) {
            return this._nodeName.split(':')[1];
        }
        return this._nodeName;
    }
    /**
     * Gets the local name of the current node.
     */
    get prefix(): string {
        if (this._nodeName.indexOf(':') !== -1) {
            return this._nodeName.split(':')[0];
        }
        return "";
    }
    /**
     * Gets the local name of the current node.
     */
    get name(): string {
        return this._nodeName;
    }
    /**
     * Gets the namespace URI of the current node; otherwise an empty string.
     */
    get namespaceURI(): string {
        let prefix = this.prefix;
        if (prefix.length > 0 && this._namespaces.has(prefix)) {
            return this._namespaces.get(prefix) as string;
        }
        return "";
    }

    /**
     * Gets the options for using in parent classes.
     */
    protected get options(): XmlReaderOptions {
        return this._options;
    }

    // ** methods

    /**
     * 
     * @param name The local name for the attribute.
     * @param ns The namespace URI of the XML document.
     */
    getAttributeNS(localName: string, namespaceURI: string): string | null {

        for (var [key, value] of this._namespaces) {
            if (value.toLowerCase() === namespaceURI.toLowerCase()) {
                let name: string = key + ':' + localName;
                if (this._attributes.has(name)) {
                    return this._attributes.get(name) as string;
                }
            }
        }
        return null;
    }

    /**
     * Move to first node attribute, if attribute exist then true; otherwise false.
     */
    moveToFirstAttribute(): boolean {

        // sanity
        if (this._attributes.size === 0) {
            return false;
        }

        // reset attribute index
        this._attributeIndex = -1;

        // done
        return this.moveToNextAttribute();
    }
    /**
     * Move to next node attribute, if successfully then true; false if there are no more attributes to read.
     */
    moveToNextAttribute(): boolean {

        // sanity
        if (this._attributeIndex >= this._attributes.size - 1) {
            return false;
        }

        // next attribute
        this._attributeIndex++;

        // apply attribute
        let idx = 0;
        for (var [key, value] of this._attributes) {
            if (idx >= this._attributeIndex) {

                // done
                this._nodeType = XmlNodeType.Attribute;
                this._nodeName = key;
                this._nodeValue = value;
                return true;
            }
            idx++;
        }

        // done
        return false;
    }

    /**
     * The next node was read, if successfully then true; false if there are no more nodes to read.
     */
    read(): boolean {

        // initialization
        let readed = false;
        let pos = this.getPosition();

        // increment depth
        if (this.nodeType === XmlNodeType.Element && this.isEmptyElement) {
            this._depth++;
        }

        // clear reader
        this.clear();

        // parsing
        if (pos < 3 && this.parseDocumentContent()) {
            readed = true;
        } else if (this.parseElementContext()) {
            readed = true;
        }

        // decrement depth
        if (readed && (this.nodeType === XmlNodeType.EndElement || (this.nodeType === XmlNodeType.Element && this._closed))) {
            this._depth--;
        }

        // done
        return readed;
    }

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

    // -----------------------------------------------------
    // ** statics

    //private static convertText(s: string, d: string, x: string, z: string): string {

    //    let xharsQuot = {
    //        constructor: false,
    //        hasOwnProperty: false,
    //        isPrototypeOf: false,
    //        propertyIsEnumerable: false,
    //        toLocaleString: false,
    //        toString: false,
    //        valueOf: false,
    //        quot: '"',
    //        QUOT: '"',
    //        amp: '&',
    //        AMP: '&',
    //        nbsp: '\u00A0',
    //        apos: '\'',
    //        lt: '<',
    //        LT: '<',
    //        gt: '>',
    //        GT: '>',
    //        copy: '\u00A9',
    //        laquo: '\u00AB',
    //        raquo: '\u00BB',
    //        reg: '\u00AE',
    //        deg: '\u00B0',
    //        plusmn: '\u00B1',
    //        sup2: '\u00B2',
    //        sup3: '\u00B3',
    //        micro: '\u00B5',
    //        para: '\u00B6'
    //    };

    //    if (z) {
    //        return xharsQuot[z] || '\x01';
    //    };

    //    if (d) {
    //        return String.fromCharCode(d);
    //    };

    //    return String.fromCharCode(parseInt(x, 16));
    //};

    ///**
    // * Convert text string to readable format.
    // * @param s
    // */
    //static convert(s: string): string {
    //    s = String(s);
    //    unescape()
    //    if (s.length > 3 && s.indexOf('&') !== -1) {
    //        if (s.indexOf('&gt;') !== -1) s = s.replace(/&gt;/g, '>');
    //        if (s.indexOf('&lt;') !== -1) s = s.replace(/&lt;/g, '<');
    //        if (s.indexOf('&quot;') !== -1) s = s.replace(/&quot;/g, '"');

    //        if (s.indexOf('&') !== -1) {
    //            s = s.replace(/&#(\d+);|&#x([0123456789abcdef]+);|&(\w+);/ig, this.convertText);
    //        };
    //    };

    //    return s;
    //}

    // ** implementation

    private clear() {
        this._attributes.clear();
        this._nodeType = XmlNodeType.None;
        this._nodeName = "";
        this._nodeValue = "";
    }
    private nextCode(): number {
        let ch = this.nextText(1);
        if (ch.length > 0) {
            return ch.charCodeAt(0);
        }
        return -1;
    }

    // parses contents
    //private parseWhitespaces(): boolean {
    //    let pos = this.getPosition();
    //    let ch = this.nextText(1);
    //    let code = (ch.length == 1) ? ch.charCodeAt(0) : 0;
    //    switch (code) {
    //        case 0xA:
    //            this._nodeValue = "\r\n";
    //            break;
    //        case 0xD:
    //            code = this.nextCode();
    //            if (code == 0xA) {
    //                pos += 2;
    //            } else {
    //                this.setPosition(pos++);
    //            }
    //            this._nodeValue = "\r\n";
    //            break;
    //        case 0x9:
    //        case 0x20:
    //            this._nodeType = XmlNodeType.Whitespace;
    //            this._nodeValue = ch;
    //            break;
    //        default:
    //            this.setPosition(pos);
    //            return false;
    //    }
    //    this._nodeType = XmlNodeType.Whitespace;
    //    return true;
    //}
    private parseComment(): boolean {
        let pos = this.getPosition();
        let s: string | null = null;
        let cnt = 4;
        while (true) {
            let ch = this.nextText(cnt);
            switch (ch) {
                case "":
                    s = null;
                    break;
                case '<!--':
                    cnt = 1;
                    s = "";
                    continue;
                case '-':
                    let p = this.getPosition();
                    if (this.nextText(2) === '->') {
                        this._nodeType = XmlNodeType.Comment;
                        break;
                    }
                    this.setPosition(p);
                    s += ch;
                    continue;
                default:
                    if (s === null || ch.length === 0) {
                        break;
                    }
                    s += ch;
                    continue;
            }

            // if correctly then done
            if (s !== null && this._nodeType === XmlNodeType.Comment) {
                this._nodeValue = s;
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }
    private parseCData() {

        let pos = this.getPosition();
        let s: string | null = null;
        let cnt = 7;
        while (true) {
            let ch = this.nextText(cnt);
            switch (ch) {
                case "":
                    s = null;
                    break;
                case '<!CDATA':
                    cnt = 1;
                    s = "";
                    continue;
                case '-':
                    let p = this.getPosition();
                    if (this.nextText(2) === '->') {
                        this._nodeType = XmlNodeType.CDATA;
                        break;
                    }
                    this.setPosition(p);
                    s += ch;
                    continue;
                default:
                    if (s === null || ch.length === 0) {
                        break;
                    }
                    s += ch;
                    continue;
            }

            // if correctly then done
            if (s !== null && this._nodeType === XmlNodeType.CDATA) {
                this._nodeValue = s;
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }
    private parseAttribute(): boolean {

        // read ont attribute (key and value)
        let pos = this.getPosition();
        let name: string = "";
        let s: string = "";
        let quote1: number = 0;
        let quote2: number = 0;
        while (true) {
            let ch = this.nextText(1);
            let code = (ch.length == 1) ? ch.charCodeAt(0) : 0;
            switch (code) {
                case 0xA:
                    if (this._normalize) {
                        s += ' ';
                    }
                    continue;
                case 0xD:
                    code = this.nextCode();
                    if (code == 0xA) {
                        if (this._normalize) {
                            s += ' ';
                        }
                    } else {
                        if (code < 0 && this._normalize) {
                            s += ' ';
                            this.setPosition(this.getPosition() - 1);
                            break;
                        }
                    }
                    continue;
                case 0x9:
                    if (this._normalize) {
                        s += ' ';
                    }
                    continue;
            }
            switch (ch) {
                case "":
                    // end of file?
                    break;
                case ' ':
                case '?':
                    // and of attribute?
                    if (name.length > 0 && quote1 % 2 === 0 && quote2 % 2 === 0) {
                        this.setPosition(this.getPosition() - 1);
                        break;
                    }
                    s += ch;
                    continue;
                case '>':
                    // and of attribute
                    this.setPosition(this.getPosition() - 1);
                    break;
                case '=':
                    // end of name?
                    if (s.trim().length > 0) {
                        name = s.trim();
                        s = "";
                        continue;
                    }
                    s += ch;
                    continue;
                case "'":
                    quote1++;
                    ch = this.nextText(1);
                    if (this.lastQuote(quote1, ch)) {
                        this.setPosition(this.getPosition() - 1);
                        break;
                    }
                    if (ch === "'") {
                        this.setPosition(this.getPosition() - 1);
                        continue;
                    }
                    s += ch;
                    continue;
                case '"':
                    quote2++;
                    ch = this.nextText(1);
                    if (this.lastQuote(quote2, ch)) {
                        this.setPosition(this.getPosition() - 1);
                        break;
                    }
                    if (ch === '"') {
                        this.setPosition(this.getPosition() - 1);
                        continue;
                    }
                    s += ch;
                    continue;
                //case '`':
                //    quote3++;
                //    ch = this.nextText(1);
                //    if (quote3 % 2 === 0 && (ch === ' ' || ch === '?' || ch === '>')) {
                //        this.setPosition(this.getPosition() - 1);
                //        break;
                //    }
                //    if (ch === '`') break;      // empty context
                //    s += ch;
                //    continue;
                case '<':
                    // attribute values cannot contain '<'
                    throw new XmlUnexpectedError(ch);
                case '&':
                    // TODO: entity referece
                    //if (pos - ps.charPos > 0) {
                    //    stringBuilder.Append(chars, ps.charPos, pos - ps.charPos);
                    //}
                    //ps.charPos = pos;

                    //int enclosingEntityId = ps.entityId;
                    //LineInfo entityLineInfo = new LineInfo(ps.lineNo, ps.LinePos + 1);
                    //switch (HandleEntityReference(true, EntityExpandType.All, out pos )) {
                    //    case EntityType.CharacterDec:
                    //    case EntityType.CharacterHex:
                    //    case EntityType.CharacterNamed:
                    //        break;
                    //    case EntityType.Unexpanded:
                    //        if (parsingMode == ParsingMode.Full && ps.entityId == attributeBaseEntityId) {
                    //            // construct text value chunk
                    //            int valueChunkLen = stringBuilder.Length - valueChunkStartPos;
                    //            if (valueChunkLen > 0) {
                    //                NodeData textChunk = new NodeData();
                    //                textChunk.lineInfo = valueChunkLineInfo;
                    //                textChunk.depth = attr.depth + 1;
                    //                textChunk.SetValueNode(XmlNodeType.Text, stringBuilder.ToString(valueChunkStartPos, valueChunkLen));
                    //                AddAttributeChunkToList(attr, textChunk, ref lastChunk );
                    //            }

                    //            // parse entity name 
                    //            ps.charPos++;
                    //            string entityName = ParseEntityName();

                    //            // construct entity reference chunk
                    //            NodeData entityChunk = new NodeData();
                    //            entityChunk.lineInfo = entityLineInfo;
                    //            entityChunk.depth = attr.depth + 1;
                    //            entityChunk.SetNamedNode(XmlNodeType.EntityReference, entityName);
                    //            AddAttributeChunkToList(attr, entityChunk, ref lastChunk );

                    //            // append entity ref to the attribute value
                    //            stringBuilder.Append('&');
                    //            stringBuilder.Append(entityName);
                    //            stringBuilder.Append(';');

                    //            // update info for the next attribute value chunk 
                    //            valueChunkStartPos = stringBuilder.Length;
                    //            valueChunkLineInfo.Set(ps.LineNo, ps.LinePos);

                    //            fullAttrCleanup = true;
                    //        }
                    //        else {
                    //            ps.charPos++;
                    //            ParseEntityName();
                    //        }
                    //        pos = ps.charPos;
                    //        break;
                    //    case EntityType.ExpandedInAttribute:
                    //        if (parsingMode == ParsingMode.Full && enclosingEntityId == attributeBaseEntityId) {

                    //            // construct text value chunk
                    //            int valueChunkLen = stringBuilder.Length - valueChunkStartPos;
                    //            if (valueChunkLen > 0) {
                    //                NodeData textChunk = new NodeData();
                    //                textChunk.lineInfo = valueChunkLineInfo;
                    //                textChunk.depth = attr.depth + 1;
                    //                textChunk.SetValueNode(XmlNodeType.Text, stringBuilder.ToString(valueChunkStartPos, valueChunkLen));
                    //                AddAttributeChunkToList(attr, textChunk, ref lastChunk );
                    //            }

                    //            // construct entity reference chunk
                    //            NodeData entityChunk = new NodeData();
                    //            entityChunk.lineInfo = entityLineInfo;
                    //            entityChunk.depth = attr.depth + 1;
                    //            entityChunk.SetNamedNode(XmlNodeType.EntityReference, ps.entity.Name.Name);
                    //            AddAttributeChunkToList(attr, entityChunk, ref lastChunk );

                    //            fullAttrCleanup = true;

                    //            // Note: info for the next attribute value chunk will be updated once we
                    //            // get out of the expanded entity
                    //        }
                    //        pos = ps.charPos;
                    //        break;
                    //    default:
                    //        pos = ps.charPos;
                    //        break;
                    //}
                    console.log("entity referece position:" + this.getPosition());
                    s += ch;
                    continue;
                default:
                    s += ch;
                    continue;
            }

            // correctly attribute?
            if (name.length > 0 && !this._attributes.has(name)) {
                this._attributes.set(name, s.trim());
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }
    private lastQuote(quote: number, ch: string): boolean {
        return quote % 2 === 0 && (ch === ' ' || ch === '?' || ch === '/' || ch === '>');
    }
    private parseAttributes() {

        // clear previous attributes
        this._attributes.clear();

        // reads the attributes
        while (this.parseAttribute()) {

            // to next attribute
        }

        //int pos = ps.charPos;
        //char[] chars = ps.chars;
        //NodeData attr = null;

        //for (; ;) {
        //    // eat whitespaces
        //    int lineNoDelta = 0;
        //    char tmpch0;
        //    unsafe { 
        //        while (((xmlCharType.charProperties[tmpch0 = chars[pos]] & XmlCharType.fWhitespace) != 0)) {
        //            if (tmpch0 == (char)0xA ) {
        //                OnNewLine(pos + 1);
        //                lineNoDelta++;
        //            }
        //                else if (tmpch0 == (char)0xD ) {
        //                if (chars[pos + 1] == (char)0xA ) {
        //                    OnNewLine(pos + 2);
        //                    lineNoDelta++;
        //                    pos++;
        //                }
        //                    else if (pos + 1 != ps.charsUsed) {
        //                    OnNewLine(pos + 1);
        //                    lineNoDelta++;
        //                }
        //                else {
        //                    ps.charPos = pos;
        //                    goto ReadData;
        //                }
        //            }
        //            pos++;
        //        }
        //    }

        //    char tmpch1;
        //    bool isNCStartName;
        //    unsafe { 
        //        isNCStartName = ((xmlCharType.charProperties[tmpch1 = chars[pos]] & XmlCharType.fNCStartName) != 0);
        //    }
        //    if (!isNCStartName) {
        //        // element end
        //        if (tmpch1 == '>') {
        //            Debug.Assert(curNode.type == XmlNodeType.Element);
        //            ps.charPos = pos + 1;
        //            parsingFunction = ParsingFunction.MoveToElementContent;
        //            goto End;
        //        }
        //        // empty element end
        //        else if (tmpch1 == '/') {
        //            Debug.Assert(curNode.type == XmlNodeType.Element);
        //            if (pos + 1 == ps.charsUsed) {
        //                goto ReadData;
        //            }
        //            if (chars[pos + 1] == '>') {
        //                ps.charPos = pos + 2;
        //                curNode.IsEmptyElement = true;
        //                nextParsingFunction = parsingFunction;
        //                parsingFunction = ParsingFunction.PopEmptyElementContext;
        //                goto End;
        //            }
        //            else {
        //                ThrowUnexpectedToken(pos + 1, ">");
        //            }
        //        }
        //        else if (pos == ps.charsUsed) {
        //            goto ReadData;
        //        }
        //        else if (tmpch1 != ':' || supportNamespaces) {
        //            Throw(pos, Res.Xml_BadStartNameChar, Exception.BuildCharExceptionStr(tmpch1));
        //        }
        //    }

        //    if (pos == ps.charPos) {
        //        Throw(Res.Xml_ExpectingWhiteSpace, ParseUnexpectedToken());
        //    }
        //    ps.charPos = pos;

        //    // save attribute name line position
        //    int attrNameLinePos = ps.LinePos;

        //    #if DEBUG
        //        int attrNameLineNo = ps.LineNo;
        //    #endif

        //    // parse attribute name 
        //    int colonPos = -1;

        //    // PERF: we intentionally don't call ParseQName here to parse the element name unless a special
        //    // case occurs (like end of buffer, invalid name char) 
        //    pos++; // start name char has already been checked

        //    // parse attribute name 
        //    ContinueParseName:
        //    char tmpch2;
        //    unsafe {
        //        while (((xmlCharType.charProperties[tmpch2 = chars[pos]] & XmlCharType.fNCName) != 0)) {
        //            pos++;
        //        }
        //    }

        //    // colon -> save prefix end position and check next char if it's name start char 
        //    if (tmpch2 == ':') {
        //        if (colonPos != -1) {
        //            if (supportNamespaces) {
        //                Throw(pos, Res.Xml_BadNameChar, Exception.BuildCharExceptionStr(':'));
        //            }
        //            else {
        //                pos++;
        //                goto ContinueParseName;
        //            }
        //        }
        //        else {
        //            colonPos = pos;
        //            pos++;
        //            unsafe {
        //                if (((xmlCharType.charProperties[chars[pos]] & XmlCharType.fNCStartName) != 0)) {
        //                    pos++;
        //                    goto ContinueParseName;
        //                }
        //            }
        //            pos = ParseQName(out colonPos );
        //            chars = ps.chars;
        //        }
        //    }
        //    else if (pos == ps.charsUsed) {
        //        pos = ParseQName(out colonPos );
        //        chars = ps.chars;
        //    }

        //    attr = AddAttribute(pos, colonPos);
        //    attr.SetLineInfo(ps.LineNo, attrNameLinePos);

        //    #if DEBUG
        //        Debug.Assert(attrNameLineNo == ps.LineNo);
        //    #endif

        //    // parse equals and quote char; 
        //    if (chars[pos] != '=') {
        //        ps.charPos = pos;
        //        EatWhitespaces(null);
        //        pos = ps.charPos;
        //        if (chars[pos] != '=') {
        //            ThrowUnexpectedToken("=");
        //        }
        //    }
        //    pos++;

        //    char quoteChar = chars[pos];
        //    if (quoteChar != '"' && quoteChar != '\'') {
        //        ps.charPos = pos;
        //        EatWhitespaces(null);
        //        pos = ps.charPos;
        //        quoteChar = chars[pos];
        //        if (quoteChar != '"' && quoteChar != '\'') {
        //            ThrowUnexpectedToken("\"", "'");
        //        }
        //    }
        //    pos++;
        //    ps.charPos = pos;

        //    attr.quoteChar = quoteChar;
        //    attr.SetLineInfo2(ps.LineNo, ps.LinePos);

        //    // parse attribute value 
        //    char tmpch3;
        //    unsafe { 
        //        while (((xmlCharType.charProperties[tmpch3 = chars[pos]] & XmlCharType.fAttrValue) != 0)) {
        //            pos++;
        //        }
        //    }

        //    if (tmpch3 == quoteChar) {
        //        #if DEBUG 
        //            if (normalize) {
        //                string val = new string(chars, ps.charPos, pos - ps.charPos);
        //                Debug.Assert(val == XmlComplianceUtil.CDataNormalize(val), "The attribute value is not CDATA normalized!");
        //            }
        //        #endif
        //        attr.SetValue(chars, ps.charPos, pos - ps.charPos);
        //        pos++;
        //        ps.charPos = pos;
        //    }
        //    else {
        //        ParseAttributeValueSlow(pos, quoteChar, attr);
        //        pos = ps.charPos;
        //        chars = ps.chars;
        //    }

        //    // handle special attributes:
        //    if (attr.prefix.Length == 0) {
        //        // default namespace declaration 
        //        if (Ref.Equal(attr.localName, XmlNs)) {
        //            OnDefaultNamespaceDecl(attr);
        //        }
        //    }
        //    else {
        //        // prefixed namespace declaration 
        //        if (Ref.Equal(attr.prefix, XmlNs)) {
        //            OnNamespaceDecl(attr);
        //        }
        //        // xml: attribute
        //        else if (Ref.Equal(attr.prefix, Xml)) {
        //            OnXmlReservedAttribute(attr);
        //        }
        //    }
        //    continue;

        //    ReadData:
        //    ps.lineNo -= lineNoDelta;
        //    if (ReadData() != 0) {
        //        pos = ps.charPos;
        //        chars = ps.chars;
        //    }
        //    else {
        //        ThrowUnclosedElements();
        //    }
        //}

        //End:
        //if (addDefaultAttributesAndNormalize) {
        //    AddDefaultAttributesAndNormalize();
        //}
        //// lookup namespaces: element
        //ElementNamespaceLookup();

        //// lookup namespaces: attributes 
        //if (attrNeedNamespaceLookup) {
        //    AttributeNamespaceLookup();
        //    attrNeedNamespaceLookup = false;
        //}

        //// check duplicate attributes
        //if (attrDuplWalkCount >= MaxAttrDuplWalkCount) {
        //    AttributeDuplCheck();
        //}
    }

    //private parseXmlDeclaration(isTextDecl: boolean): boolean {

    //    // parses the xml or text declaration and switched encoding if needed
    //    let pos = this.getPosition();
    //    let cnt = 5;
    //    while (true) {
    //        let ch = this.nextText(cnt);
    //        switch (ch) {
    //            case '<?xml':
    //                cnt = 1;
    //                this.parseAttributes();
    //                continue;
    //            case ' ':
    //                continue;
    //            case '?':
    //                let p = this.getPosition();
    //                if (this.nextText(2) == '?>') {

    //                    // end of xml declaration
    //                    this._nodeType = XmlNodeType.XmlDeclaration;
    //                    break;
    //                }
    //                this.setPosition(p);
    //                break;
    //            default:
    //                break;
    //        }

    //        // done
    //        return (this._nodeType === XmlNodeType.XmlDeclaration);
    //    }
    //} 
    private parseText(): boolean {

        // parses a chunk of text, returns true when the whole value has been parsed,
        // otherwise return false when it needs to be called again to get a next chunk of value
        let pos = this.getPosition();
        let s: string = "";
        let spaces = 0;
        let quote1: number = 0;
        let quote2: number = 0;
        while (true) {
            let ch = this.nextText(1);
            let code = (ch.length == 1) ? ch.charCodeAt(0) : 0;
            switch (code) {
                case 0xA:
                    continue;
                case 0xD:
                    code = this.nextCode();
                    if (code == 0xA) {
                    } else {
                        if (code < 0) {
                            this.setPosition(this.getPosition() - 1);
                            break;
                        }
                    }
                    continue;
                case 0x9:
                    continue;
            }
            switch (ch) {
                case "":
                    // end of file?
                    break;
                case '=':
                    s += ch;
                    continue;
                case "'":
                    quote1++;
                    ch = this.nextText(1);
                    if (quote1 % 2 === 0 && (ch === '<' || ch === '>')) {
                        this.setPosition(this.getPosition() - 1);
                        break;
                    }
                    s += ch;
                    continue;
                case '"':
                    quote2++;
                    ch = this.nextText(1);
                    if (quote2 % 2 === 0 && (ch === '<' || ch === '>')) {
                        this.setPosition(this.getPosition() - 1);
                        break;
                    }
                    s += ch;
                    continue;
                case '<':
                    // return partial value
                    if (quote1 % 2 === 0 && quote2 % 2 === 0) {
                        this.setPosition(this.getPosition() - 1);
                        break;
                    }
                    s += ch;
                    continue;
                case '&':
                    // try to parse char entity inline
                    //    int charRefEndPos, charCount;
                    //    EntityType entityType;
                    //    if ((charRefEndPos = ParseCharRefInline(pos, out charCount, out entityType )) > 0) {
                    //        if (rcount > 0) {
                    //            ShiftBuffer(rpos + rcount, rpos, pos - rpos - rcount);
                    //        }
                    //        rpos = pos - rcount;
                    //        rcount += (charRefEndPos - pos - charCount);
                    //        pos = charRefEndPos;

                    //        if (!xmlCharType.IsWhiteSpace(chars[charRefEndPos - charCount]) ||
                    //            (v1Compat && entityType == EntityType.CharacterDec)) {
                    //            orChars |= 0xFF;
                    //        }
                    //    }
                    //    else {
                    //        if (pos > ps.charPos) {
                    //            goto ReturnPartialValue;
                    //        }
                    //        switch (HandleEntityReference(false, EntityExpandType.All, out pos )) {
                    //            case EntityType.Unexpanded:
                    //                // make sure we will report EntityReference after the text node 
                    //                nextParsingFunction = parsingFunction;
                    //                parsingFunction = ParsingFunction.EntityReference;
                    //                // end the value (returns nothing) 
                    //                goto NoValue;
                    //            case EntityType.CharacterDec:
                    //                if (!v1Compat) {
                    //                    goto case EntityType.CharacterHex; 
                    //        }
                    //        orChars |= 0xFF;
                    //        break; 
                    //                case EntityType.CharacterHex:
                    //case EntityType.CharacterNamed:
                    //    if (!xmlCharType.IsWhiteSpace(ps.chars[pos - 1])) {
                    //        orChars |= 0xFF;
                    //    }
                    //    break;
                    //default:
                    //    pos = ps.charPos;
                    //    break;
                    //console.log("maybe entity inline:" + this.getPosition());
                    s += ch;
                    continue;
                default:
                    if (ch === ' ') {
                        spaces++;
                    }
                    s += ch;
                    continue;
            }

            // correctly attribute?
            if (s.length > spaces) {
                this._nodeType = XmlNodeType.Text;
                this._nodeValue = s;
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }

    private parseDocTypeDeclaration(): boolean {

        // parses DOCTYPE declaration
        let pos = this.getPosition();
        let s: string | null = null;
        let cnt = 4;
        while (true) {
            let ch = this.nextText(cnt);
            switch (ch) {
                case "":
                    s = null;
                    break;
                case '<!DOCTYPE':
                    cnt = 1;
                    s = "";
                    continue;
                case '!':
                    let p = this.getPosition();
                    if (this.nextText(1) === '>') {
                        this._nodeType = XmlNodeType.DocumentType;
                        break;
                    }
                    this.setPosition(p);
                    s += ch;
                    continue;
                default:
                    if (s === null || ch.length === 0) {
                        break;
                    }
                    s += ch;
                    continue;
            }

            // if correctly then done
            if (s !== null && this._nodeType === XmlNodeType.DocumentType) {
                this._nodeValue = s;
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }
    private parseMeta(): boolean {

        // parses metadata
        let pos = this.getPosition();
        let nodeType = XmlNodeType.None;
        let meta = this.nextText(2);
        if (meta === '<?') {
            let s = "";
            while (true) {
                let ch = this.nextText(1);
                switch (ch) {
                    case ' ':
                        if (nodeType === XmlNodeType.None && s.length > 0) {
                            if (s.toLowerCase().startsWith("xml")) {
                                nodeType = XmlNodeType.XmlDeclaration;
                            } else {
                                nodeType = XmlNodeType.Meta;
                            }
                            this._nodeName = s.trim();
                            this.parseAttributes();
                            s = "";
                        } else {
                            s += ch;
                        }
                        continue;
                    case '?':
                        let p = this.getPosition();
                        if (this.nextText(1) === '>') {
                            this._nodeType = nodeType;
                            break;
                        }
                        this.setPosition(p);
                        s += ch;
                        continue;
                    default:
                        if (s === null || ch.length === 0) {
                            break;
                        }
                        s += ch;
                        continue;
                }

                // if correctly then done
                if (nodeType !== XmlNodeType.None && this._nodeType === nodeType) {
                    this._nodeValue = s;
                    return true;
                }

                // unexpected
                break;
            }
        }

        // bad done, restore position
        this.setPosition(pos);
        return false;
    }
    private parseEndElement(): boolean {

        // parses end of element
        let pos = this.getPosition();
        let s: string | null = null;
        let cnt = 2;
        while (true) {
            let ch = this.nextText(cnt);
            switch (ch) {
                case "":
                    s = null;
                    break;
                case '</':
                    cnt = 1;
                    s = "";
                    continue;
                case '>':
                    this._nodeType = XmlNodeType.EndElement;
                    break;
                default:
                    if (s === null || ch.length === 0) {
                        break;
                    }
                    s += ch;
                    continue;
            }

            // if correctly then done
            if (s !== null && s.length > 0 && this._nodeType === XmlNodeType.EndElement) {
                this._nodeName = s;
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }
    private parseElementContext(): boolean {

        // parse the element context
        let pos = this.getPosition();
        while (true) {
            let ch = this.nextText(1);
            switch (ch) {

                // end?
                case "":
                    break;

                // some tag 
                case '<':
                    ch = this.nextText(1);
                    switch (ch) {
                        case '?':
                            // processing instruction
                            this.setPosition(this.getPosition() - 2);
                            if (this.parseMeta()) {
                                if (this._options.ignoreMeta) {
                                    this.clear();
                                    continue;
                                }
                                break;
                            }
                            continue;
                        case '!':
                            // comment
                            this.setPosition(this.getPosition() - 2);
                            if (this.parseComment()) {
                                if (this._options.ignoreComments) {
                                    this.clear();
                                    continue;
                                }
                                break;
                            }
                            if (this.parseCData()) {
                                break;
                            }
                            // bad xml?
                            break;
                        case '/':
                            // element end tag?
                            this.setPosition(this.getPosition() - 2);
                            if (this.parseEndElement()) {
                                break;
                            }
                            // bad xml?
                            break;

                        default:
                            if (ch.length === 0) {
                                // end of file
                            } else {
                                // new element start tag?
                                this.setPosition(this.getPosition() - 2);
                                this.parseElement();
                            }
                            break;
                    }
                    break;

                // element end tag
                case '&':
                    this.setPosition(this.getPosition() - 1);
                    if (this.parseText()) {
                        break;
                    }
                    continue;
                default:
                    if (ch.length === 0) {
                        // end of file
                        break;
                    } else {
                        // text node, whitespace or entity reference 
                        this.setPosition(this.getPosition() - 1);
                        if (this.parseText()) {
                            return true;
                        }
                        this.setPosition(this.getPosition() + 1);
                    }
                    continue;
            }

            // if correctly then done
            if (this._nodeType !== XmlNodeType.None) {
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }
    private parseDocumentContent(): boolean { 

        // parses the document content
        let pos = this.getPosition();
        while (true) {
            let ch = this.nextText(1);
            switch (ch) {

                // end?
                case "":
                    break;

                // some tag 
                case '<':
                    ch = this.nextText(1);
                    switch (ch) {
                        case '?':
                            // xml meta or processing instruction?
                            this.setPosition(this.getPosition() - 2);
                            if (this.parseMeta()) {
                                if (this.nodeType === XmlNodeType.Meta && this._options.ignoreMeta) {
                                    this.clear();
                                    continue;
                                }
                                break;
                            }
                            continue;
                        case '!':
                            this.setPosition(this.getPosition() - 2);
                            if (this.parseComment()) {
                                if (this._options.ignoreComments) {
                                    this.clear();
                                    continue;
                                }
                                break;
                            }
                            if (this.parseCData()) {
                                break;
                            }
                            if (this.parseDocTypeDeclaration()) {
                                break;
                            }
                            // bad xml?
                            break;

                        // element end tag
                        case '/':
                            throw new XmlUnexpectedError(`${ch} as end tag`);

                        default:
                            if (ch.length === 0) {
                                // end of file
                            } else {
                                // root element?
                                this.setPosition(this.getPosition() - 2);
                                this.parseElement();
                            }
                            break;
                    }
                    break;

                case '&':
                    this.setPosition(this.getPosition() - 1);
                    if (this.parseText()) {
                        break;
                    }
                    //if (fragmentType == XmlNodeType.Document) {
                    //    Throw(pos, Res.Xml_InvalidRootData);
                    //}
                    //else {
                    //    if (fragmentType == XmlNodeType.None) {
                    //        fragmentType = XmlNodeType.Element;
                    //    }
                    //    int i;
                    //    switch (HandleEntityReference(false, EntityExpandType.OnlyGeneral, out i )) {
                    //        case EntityType.Unexpanded:
                    //            if (parsingFunction == ParsingFunction.EntityReference) {
                    //                parsingFunction = nextParsingFunction;
                    //            }
                    //            ParseEntityReference();
                    //            return true;
                    //        case EntityType.CharacterDec:
                    //        case EntityType.CharacterHex:
                    //        case EntityType.CharacterNamed:
                    //            if (ParseText()) {
                    //                return true;
                    //            }
                    //            continue;
                    //        default:
                    //            chars = ps.chars;
                    //            pos = ps.charPos;
                    //            continue;
                    //    }
                    //}
                    continue;
                default:
                    if (ch.length === 0) {
                        // end of file
                        break;
                    } else {
                        // text node, whitespace or entity reference 
                        this.setPosition(this.getPosition() - 1);
                        if (this.parseText()) {
                            break;
                        }
                    }
                    continue;
            }

            // if correctly then done
            if (this._nodeType !== XmlNodeType.None) {
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    } 
    private parseElement() { 

       // parses the element start tag 
        let pos = this.getPosition();
        let name: string | null = null;
        while (true) {
            let ch = this.nextText(1);
            switch (ch) {
                case '<':
                    // start element
                    name = "";
                    continue;
                case '>':
                    // move to element content
                    if (name !== null && name.length > 0) {
                        this._nodeType = XmlNodeType.Element;
                        this._nodeName = name;
                    }
                    break;
                case '/':
                    // empty element
                    this._closed = true;
                    continue;
                case ' ':
                    this.parseAttributes();
                    continue;
                case ":":
                    // namespace?
                    if (this._options.check && name !== null && this._namespaces.has(name)) {
                        throw new XmlUnexpectedError(name);
                    }
                    name += ch;
                    continue;
                default:
                    if (name === null) {
                        break;
                    }
                    name += ch;
                    continue;
            }

            // if correctly then done
            if (this._nodeType !== XmlNodeType.None) {
                return true;
            }

            // bad done, restore position
            this.setPosition(pos);
            return false;
        }
    }
}
