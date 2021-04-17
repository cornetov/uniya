let ijk = 9;

//import * as http from 'http';
import cli from 'jest';
//import { XmlTextReader, XmlNode, XmlNodeType } from "./packages/uniya-xml/src/index";
import { XmlNode, XmlNodeType } from "./packages/uniya-xml/src/XmlNode";
import { XmlTextReader } from "./packages/uniya-xml/src/XmlTextReader";

//const fetch = require("node-fetch");
var fs = require('fs');
//import * from "./packages/uniya/__tests__/base.test";

function readXml(xml: string): Map<string, string> {

    // initialization
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

    // done
    return terms;
}


async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {

    console.log('Start of testing...');

    //let sp = new SharePoint("https://practic.sharepoint.com/sites/register");
    //try {
    //    await sleep(2000);
    //    let msg = await sp.authenticate("ogolikov@a-practic.ru", "HELGY66d");
    //    if (msg.length > 0) {
    //        console.log(msg);
    //        return;
    //    }
    //} catch (error) {
    //    console.log(error);
    //}

    let xml = '<Header><DocDate>28.07.2016</DocDate></Header>';
    let node = XmlNode.parse(xml) as XmlNode;

    let text = node.toXMLString()
    if (text !== xml) {
        console.log('Bad compare:');
        console.log(`${xml}`);
        console.log(`${text}`);
    }

    //xml = '<?xml version="1.0" encoding="utf-8" ?><root><data name="Error" xml: space = "preserve" > <value>&#x41E;&#x448;&#x438;&#x431;&#x43A;&#x430; </value></data > <data name="Summary" xml: space = "preserve" > <value>&#x420;&#x435;&#x437;&#x44E;&#x43C;&#x435; </value></data > </root>'

    const testFolder = __dirname + '\\packages\\uniya-xml\\__tests__\\xmls';
    let files = fs.readdirSync(testFolder);
    for (let file of files) {
        let data = fs.readFileSync(`${testFolder}\\${file}`, 'utf8');
        console.log(`Start ${file}`);
        node = XmlNode.parse(data.toString()) as XmlNode;
        text = node.toXMLString()
        console.log(text.substr(0, Math.min(80, text.length)));
        if (file === "ru.xml") {
            let map = readXml(data.toString());
            if (map !== null && map.size > 0) {
                for (var [key, value] of map) {
                    console.log(`${key}=${value}`);
                }
            }
        }
        console.log(`Finish ${file}`);
    }
    //fs.readFile(__dirname + '/samples/xmls/ru.xml', function (err: string, data: object) {
    //    if (err) {
    //        throw err;
    //    }
    //    //console.log(data.toString());

    //    let map = readXml(data.toString());
    //    for (var [key, value] of map) {
    //        console.log(`${key}=${value}`);
    //    }
    //});

    // fetch
    //const response = await fetch("https://localhost:44302/Terms");
    //const response = await fetch("./ru.xml");
    //if (!response.ok) {
    //    throw Error(response.statusText);
    //}
    //const data = await response.text();

    //let map = readXml(data);
    //for (var [key, value] of map) {
    //    console.log(`${key}=${value}`);
    //}

    await sleep(9000);

    // run test in node.js
    cli.run();

    //for (let i = 0; i < 9; i++) {
    //    console.log(`Index: ${i} `);
    //    await sleep(1000);
    //}

    console.log('Done.');

    // wait
    await sleep(99000);
}

try {
    main();
}
catch (e) {
    console.log(e);
}
