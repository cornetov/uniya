import { Core } from "./Core";


/**
 * Base64 static encoding class.
 * @class Base64
 */
export class Base64 {

    /**
     * Convert ucs-2 string to base64 encoded ascii
     * @param str {string} The common ucs-2 string.
     */
    public static encode(str: string): string {

        if (Core.isNode) {
            let buffer = Buffer.from(str, 'utf8');
            return buffer.toString('base64');
        }

        //Hello World
        //SGVsbG8gV29ybGQ=
        return btoa(unescape(encodeURIComponent(str)));
    }

    /**
     * Convert base64 encoded ascii to ucs-2 string
     * @param str {string} The base64 encoded ascii.
     */
    public static decode(str: string): string {

        if (Core.isNode) {
            let buffer = Buffer.from(str, 'base64');
            return buffer.toString('utf8');
        }

        //> console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'))
        //Hello World
        return decodeURIComponent(escape(atob(str)));
    }
}