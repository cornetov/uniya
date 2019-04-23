import { XmlTextReader, XmlTextWriter, XmlNode, XmlNodeType } from "../src/index";
var fs = require('fs');

//const testIfCondition = mySkipCondition ? test.skip : test;

describe("Base XML tests >>>", () => {

    //describe('XCore tests', () => {
    //    var to = { test: "Simple", value: 78.9 };
    //    it('should be true', () => {
    //        expect(XCore.isEmpty(to)).to.equal(false);
    //    });
    //    it('should be false', () => {
    //        expect(XCore.isEmpty({})).to.equal(true);
    //    });
    //    it('should be 3 test value', () => {
    //        expect(XCore.repeater(to.test, 3)).to.equal("SimpleSimpleSimple");
    //    });
    //    it('should be value number', () => {
    //        let clone = XCore.clone(to);
    //        expect(clone["value"]).to.equal(78.9);
    //    });
    //});

    //describe('XStack push/pop tests', () => {
    //    var stack = new XStack<string>();
    //    stack.push('first');
    //    stack.push('second');
    //    it('should be second', () => {
    //        expect(stack.peek()).to.equal('second');
    //    });
    //    it('should be second', () => {
    //        expect(stack.pop()).to.equal('second');
    //    });
    //    it('should be first', () => {
    //        expect(stack.pop()).to.equal('first');
    //    });
    //});

    describe('parse XML element: let node = XmlNode.parse(xml); // xml=\'<Header><DocDate>28.07.2016...', () => {

        let xml = '<Header><DocDate>28.07.2016</DocDate></Header>';
        let node = XmlNode.parse(xml) as XmlNode;

        it('node.nodeType should be XmlNodeType.Element', () => {
            expect(node.nodeType).toEqual(XmlNodeType.Element);
        });
        it('node.childNodes.length should be 1 child element', () => {
            expect(node.childNodes.size).toEqual(1);
        });
        //it('node.childNodes.get(0).childNodes.get(0).nodeValue should be 28.07.2016', () => {
        //    expect(node.childNodes.get(0).childNodes.get(0).nodeValue).to.equal('28.07.2016');
        //});
        it('node.toXMLString() should be xml=\'<Header><DocDate>28.07.2016...', () => {
            expect(node.toXMLString()).toEqual(xml);
        });
    });

    describe('parse XML document: let node = XmlNode.parse(xml); // xml=\'<?xml version="1.0" encoding="utf-8"?><Root xmlns:xsi=...', () => {

        let xml = '<?xml version="1.0" encoding="utf-8"?><Root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Header standalone="no"><Description>Cake with grapes 300g</Description><DocDate>28.07.2016</DocDate></Header></Root>'
        let node = XmlNode.parse(xml) as XmlNode;

        it('node.nodeType should be XmlNodeType.Document', () => {
            expect(node.nodeType).toEqual(XmlNodeType.Document);
        });
        //it('node.childNodes.get(0).attributes.get("encoding") should be utf-8', () => {
        //    expect(node.childNodes.get(0).attributes.get("encoding")).to.equal('utf-8');
        //});
        //it('node.childNodes.get(0).childNodes.get(1).childNodes.get(0).nodeValue should be 28.07.2016', () => {
        //    expect(node.childNodes.get(1).childNodes.get(0).childNodes.get(1).childNodes.get(0).nodeValue).to.equal('28.07.2016');
        //});
        it('node.toXMLString() should be xml=\'<?xml version="1.0" encoding="utf-8"?><Root xmlns:xsi=...', () => {
            expect(node.toXMLString()).toEqual(xml);
        });
    });

    describe('read terms from XML file using XmlTextReader...', () => {

        // file data
        const fileName = __dirname + '\\xmls\\ru.xml';
        var data = fs.readFileSync(fileName, 'utf8');

        // initialization
        const xml = data.toString();
        const xr = new XmlTextReader(xml);
        let terms = new Map<string, string>();
        let termName = "";

        // read each node
        while (xr.read()) {

            switch (xr.nodeType) {
                case XmlNodeType.Element:
                    switch (xr.name) {
                        case "data":
                            if (xr.hasAttributes) {
                                for (var [key, value] of xr.attributes) {
                                    if (key === "name") {
                                        termName = value;
                                        break;
                                    }
                                }
                            }
                            break;
                    }
                    break;
                case XmlNodeType.Text:
                    if (termName.length > 0) {

                        // decoding
                        let idx = 0;
                        let value = xr.value;
                        while (idx < value.length) {
                            let begin = value.indexOf('&#x', idx);
                            if (begin !== -1) {
                                let end = value.indexOf(';', begin);
                                if (end !== -1) {
                                    let code = value.substr(begin + 3, end - begin - 3);
                                    while (code.length < 4) {
                                        code = '0' + code;
                                    }
                                    value = value.substr(0, begin) + unescape('%u' + code) + value.substr(end + 1);
                                }
                                idx = begin;
                            }
                            idx++;
                        }

                        // set
                        terms.set(termName, value);
                        termName = "";
                    }
                    break;
            }
        }

        it(`xml file ru.xml should be not empty`, () => {
            expect(xml.length).toBeGreaterThan(20);
        });
        it(`xml file should be contains terms`, () => {
            expect(terms.size).toBeGreaterThan(10);
        });
    });

    describe('read XML files using XmlTextReader...', () => {

        let okey = 0;
        let count = 0;
        const testFolder = __dirname + '\\xmls';
        var files = fs.readdirSync(testFolder);
        for (let file of files) {
            let data = fs.readFileSync(`${testFolder}\\${file}`, 'utf8');
            const node = XmlNode.parse(data.toString()) as XmlNode;
            const text = node.toXMLString();
            if (text.length > 0 && node.hasChildNodes) {
                okey++;
            }
            count++;
            it(`success loaded ${file} xml file`, () => {
                expect(text.length).toBeGreaterThan(40);
            });
        }
        it(`success loaded ${okey} from ${count} xml files`, () => {
            expect(count).toBe(okey);
        });
    });

    describe('write XML element: let writer = new XmlTextWriter().startElement("Header").writeElement("DocDate", "28.07.2016")...', () => {

        let writer = new XmlTextWriter();
        writer.startElement("Header").writeElement("DocDate", "28.07.2016").endElement();

        let xml = writer.toString();
        let node = XmlNode.parse(xml) as XmlNode;

        it('node.nodeType should be XmlNodeType.Element', () => {
            expect(node.nodeType).toEqual(XmlNodeType.Element);
        });
        it('node.childNodes.length should be 1 child element', () => {
            expect(node.childNodes.size).toEqual(1);
        });
        //it('node.childNodes.get(0).nodeName should be DocDate', () => {
        //    expect(node.childNodes.get(0).nodeName).to.equal('DocDate');
        //});
        it('writer.toXMLString() should be node.toXMLString() [node is parse result]', () => {
            expect(xml).toEqual(node.toXMLString());
        });
    });

    describe('write XML document: let node = new XmlTextWriter().startDocument("1.0", "utf-8").startElement("Root")...', () => {

        let writer = new XmlTextWriter();
        writer.startDocument("1.0", "utf-8");
        writer.startElement("Root").writeAttributeNS("xmlns", "xsi", "http://www.w3.org/2001/XMLSchema-instance");
        writer.startElement("Header").writeAttribute("standalone", "no");
        writer.writeElement("Description", "Cake with grapes 300g");
        writer.writeElement("DocDate", "28.07.2016");
        writer.endElement()
        writer.endElement();
        writer.endDocument();

        let xml = writer.toString();
        let node = XmlNode.parse(xml) as XmlNode;

        it('node.nodeType should be XmlNodeType.Document', () => {
            expect(node.nodeType).toEqual(XmlNodeType.Document);
        });
        //it('node.childNodes.get(1).childNodes.get(0).childNodes.length should be 2 child element', () => {
        //    expect(node.childNodes.get(1).childNodes.get(0).childNodes.length).to.equal(2);
        //});
        //it('node.childNodes.get(0).childNodes.get(1).childNodes.get(0).nodeValue should be 28.07.2016', () => {
        //    expect(node.childNodes.get(1).childNodes.get(0).childNodes.get(1).childNodes.get(0).nodeValue).to.equal('28.07.2016');
        //});
        it('writer.toXMLString() should be node.toXMLString() [node is parse result]', () => {
            expect(xml).toEqual(node.toXMLString());
        });
    });

    //let node = XmlNode.parse('<?xml version="1.0" encoding="utf-8"?><Root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Header standalone="no"><Description>Ë¥ë¯ í†í³¨î¯£ñ¡¥®ê¡±í²¦í¶­êž³00á¡X ð±®å´ªðº®„escription><DocDate>28.07.2016</DocDate></Header></Root>');
    //expect(node.childNodes.length).to.equal("1");
    //expect(node.childNodes[0].name).to.equal("Root");

    //let connections: Connection[];
    //before(async () => connections = await createTestingConnections({
    //    entities: [__dirname + "/entity/*{.js,.ts}"],
    //    schemaCreate: true,
    //    dropSchemaOnConnection: true,        
    //}));
    //after(() => closeTestingConnections(connections));

    //it("should sync even when there unqiue constraints placed on similarly named columns", () => Promise.all(connections.map(async connection => {        
    //   // By virtue that we got here means that it must have worked.
    //   expect(true).is.true;
    //})));
});