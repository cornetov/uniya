let ijk = 9;

//import * as http from 'http';
import cli from 'jest';
import { XmlNode } from "./packages/uniya-xml/src/XmlNode";

//import * from "./packages/uniya/__tests__/base.test";


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

    // run test in node.js
    cli.run();

    //for (let i = 0; i < 9; i++) {
    //    console.log(`Index: ${i} `);
    //    await sleep(1000);
    //}

    console.log('Done.');
    await sleep(99000);
}

main();
